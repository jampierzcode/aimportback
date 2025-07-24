import PedidoStatus from '#models/pedido_status'
import type { HttpContext } from '@adonisjs/core/http'

export default class PedidosStatusesController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    try {
      const pedidos_status = await PedidoStatus.all()

      return {
        status: 'success',
        message: 'pedidos_status fetched with success',
        data: pedidos_status,
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
      const pedido_status = await PedidoStatus.findOrFail(params.id)

      return {
        status: 'success',
        message: 'sede fetched with success',
        data: pedido_status,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'sede fetched with error',
        error: error,
      }
    }
  }

  // Crear un nuevo sede (POST /plans)
  public async store({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const data = request.only([
        'pedido_id',
        'status',
        'submotivo',
        'observacion',
        'fecha_reprogramacion',
      ]) // Asume que estos campos existen
      const pedido_status = await PedidoStatus.create({ ...data, user_id: auth.user!.id })

      return {
        status: 'success',
        message: 'course saved with success',
        data: pedido_status,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error saved course',
        error: error,
      }
    }
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    try {
      const pedido_status = await PedidoStatus.findOrFail(params.id)
      const data = request.only([
        'pedido_id',
        'user_id',
        'status',
        'submotivo',
        'observacion',
        'fecha_reprogramacion',
      ]) // Asume que estos campos existen
      pedido_status.merge(data)
      await pedido_status.save()

      return {
        status: 'success',
        message: 'courses fetched with success',
        data: pedido_status,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'courses fetched with error',
        error: error,
      }
    }
  }

  // Eliminar un sede (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    try {
      const pedido_status = await PedidoStatus.findOrFail(params.id)
      await pedido_status.delete()
      return {
        status: 'success',
        message: 'course deleted successfully',
        data: pedido_status,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'courses fetched with error',
        error: error,
      }
    }
  }
}
