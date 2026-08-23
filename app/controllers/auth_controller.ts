import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async updatePassword({ request }: HttpContext) {
    const { email, newPassword } = request.only(['email', 'newPassword'])

    const user = await User.findBy('email', email)

    if (!user) {
      return {
        status: 'error',
        message: 'Usuario no encontrado',
      }
    }

    user.password = newPassword
    await user.save()

    return {
      data: user,
      status: 'success',
      message: 'Contraseña actualizada correctamente',
    }
  }

  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create(data)

    return User.accessTokens.create(user, ['*'], {
      expiresIn: '30 days',
    })
  }
  async createUser({ request }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)
      const user = await User.create(data)
      return {
        status: 'success',
        code: 201,
        message: 'Usuario Creado correctamente',
        data: user,
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        code: 500,
        message: 'Error creating plan',
        error: error.message,
      }
    }
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    return User.accessTokens.create(user)
  }

  async logout({ auth }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return { message: 'success' }
  }

  // Actualiza los datos del propio usuario autenticado (nombre, email y,
  // opcionalmente, contraseña). No permite tocar rol_id ni sede_id.
  async updateProfile({ request, auth, response }: HttpContext) {
    const isLoggedIn = await auth.check()
    if (!isLoggedIn || !auth.user) {
      return response.unauthorized({ status: 'error', message: 'No autenticado' })
    }

    const { name, email, password } = request.only(['name', 'email', 'password'])

    try {
      const usuario = auth.user

      if (email && email !== usuario.email) {
        const emailTaken = await User.query()
          .where('email', email)
          .whereNot('id', usuario.id)
          .first()
        if (emailTaken) {
          return response.badRequest({
            status: 'error',
            message: 'Ese email ya está en uso por otro usuario',
          })
        }
        usuario.email = email
      }

      if (name) usuario.name = name

      if (password) {
        if (String(password).length < 8) {
          return response.badRequest({
            status: 'error',
            message: 'La contraseña debe tener al menos 8 caracteres',
          })
        }
        usuario.password = password
      }

      await usuario.save()
      await usuario.load('rol')
      await usuario.load('sede')

      return { status: 'success', message: 'Perfil actualizado correctamente', user: usuario }
    } catch (error) {
      return response.badRequest({
        status: 'error',
        message: 'No se pudo actualizar el perfil',
        error: error.message,
      })
    }
  }

  async me({ auth }: HttpContext) {
    const data_auth = await auth.check()
    if (data_auth === false) {
      return { user: data_auth }
    } else {
      // Cargar el usuario autenticado junto con el rol y el creador
      const user = await User.query()
        .where('id', auth.user!.id)
        .preload('rol')
        .preload('sede')
        // .preload('creator') // Pre-cargar la relación 'creator' (autorreferencial)
        .firstOrFail()

      // Devolver el usuario con los datos de rol y creador
      return { user }
    }
  }
}
