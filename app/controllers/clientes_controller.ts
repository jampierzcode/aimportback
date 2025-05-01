import Campaign from '#models/campaign'
import Cliente from '#models/cliente'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientesController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    try {
      const clientes = await Cliente.all()

      return {
        status: 'success',
        message: 'clientes fetched with success',
        data: clientes,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'courses fetched with error',
        error: error,
      }
    }
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    try {
      console.log(params)
      const cliente = await Cliente.findOrFail(params.id)
      console.log(cliente)

      return {
        status: 'success',
        message: 'cliente fetched with success',
        data: cliente,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'cliente fetched with error',
        error: error,
      }
    }
  }

  // Mostrar canpañas de cliente logueado (GET /plans/:id)
  public async campaigns({ auth }: HttpContext) {
    try {
      await auth.check()
      const userId = auth.user!.id
      // Buscar el cliente por el user_id
      const cliente = await Cliente.findBy('usuario_id', userId)

      if (!cliente) {
        return [] // o return response.notFound({ message: 'Cliente no encontrado' })
      }

      // Buscar campañas por cliente_id
      const campaigns = await Campaign.query().where('cliente_id', cliente.id)

      return campaigns
    } catch (error) {
      return {
        status: 'error',
        message: 'cliente fetched with error',
        error: error,
      }
    }
  }

  // Crear un nuevo cliente (POST /plans)
  public async store({ request }: HttpContext) {
    try {
      const data = request.only(['usuario_id', 'razon_social', 'ruc', 'direccion']) // Asume que estos campos existen
      const cliente = await Cliente.create(data)

      return {
        status: 'success',
        message: 'cliente saved with success',
        data: cliente,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error saved cliente',
        error: error,
      }
    }
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      const data = request.only(['usuario_id', 'razon_social', 'ruc', 'direccion']) // Asume que estos campos existen
      cliente.merge(data)
      await cliente.save()

      return {
        status: 'success',
        message: 'cliente update with success',
        data: cliente,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'cliente update with error',
        error: error,
      }
    }
  }

  // Eliminar un cliente (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      await cliente.delete()
      return {
        status: 'success',
        message: 'cliente deleted successfully',
        data: cliente,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'cliente fetched with error',
        error: error,
      }
    }
  }
}
