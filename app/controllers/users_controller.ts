import User from '#models/user'
import { registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    try {
      const usuarios = await User.all()
      return {
        status: 'success',
        message: 'sedes fetched with success',
        data: usuarios,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'usuarios fetched with error',
        error: error,
      }
    }
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    try {
      console.log(params)
      const usuario = await User.findOrFail(params.id)
      console.log(usuario)
      return {
        status: 'success',
        message: 'sedes fetched with success',
        data: usuario,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'usuario fetched with error',
        error: error,
      }
    }
  }
  public async usersSuperadmin({ params }: HttpContext) {
    try {
      console.log(params)
      const usuario = await User.query().whereNot('rol_id', 1)
      console.log(usuario)
      return {
        status: 'success',
        message: 'sedes fetched with success',
        data: usuario,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'usuario fetched with error',
        error: error,
      }
    }
  }

  // Crear un nuevo usuario (POST /plans)
  public async store({ request }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)
      const usuario = await User.create(data)

      return {
        status: 'success',
        message: 'usuario fetched with success',
        data: usuario,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'usuario store with error',
        error: error,
      }
    }
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    try {
      const usuario = await User.findOrFail(params.id)
      const data = request.only(['name', 'rol_id', 'sede_id'])
      usuario.merge(data)
      await usuario.save()

      return {
        status: 'success',
        message: 'usuario fetched with success',
        data: usuario,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'usuario update with error',
        error: error,
      }
    }
  }

  // Eliminar un usuario (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    try {
      const usuario = await User.findOrFail(params.id)
      await usuario.delete()
      return {
        status: 'success',
        message: 'usuario deleted successfully',
        data: usuario,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'usuario destroy error',
        error: error,
      }
    }
  }
}
