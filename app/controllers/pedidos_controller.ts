import Campaign from '#models/campaign'
import Pedido from '#models/pedido'
import type { HttpContext } from '@adonisjs/core/http'

export default class PedidosController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    const pedidos = await Pedido.all()
    return pedidos
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    console.log(params)
    const pedido = await Pedido.findOrFail(params.id)
    console.log(pedido)
    return pedido
  }
  // Mostrar un plan individual por ID (GET /plans/:id)
  public async pedidoByTracking({ params }: HttpContext) {
    console.log(params)
    const pedido = await Pedido.query()
      .where('id_solicitante', params.id_solicitante)
      .preload('origen')
      .preload('destino')
      .first()
    console.log(pedido)
    return pedido
  }

  // Crear un nuevo pedido (POST /plans)
  public async store({ request }: HttpContext) {
    const data = request.only([
      'id_solicitante',
      'nombre_solicitante',
      'direccion',
      'referencia',
      'celular',
      'ubigeo',
      'marca',
      'num_cajas',
      'status',
      'origen_id',
      'destino_id',
    ]) // Asume que estos campos existen
    const pedido = await Pedido.create(data)
    return pedido
  }
  public async pedidosMasive({ request }: HttpContext) {
    try {
      const { campaign_name, pedidos } = request.only(['campaign_name', 'pedidos'])

      if (!campaign_name || !Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de pedidos está vacía',
        }
      }
      // 📌 Crear la campaña
      const campaign = await Campaign.create({ name: campaign_name })
      // 📌 Agregar el ID de la campaña a cada pedido
      const pedidosInsert = pedidos.map((pedido) => ({
        id_solicitante: pedido.id_solicitante,
        nombre_solicitante: pedido.nombre_solicitante,
        direccion: pedido.direccion,
        referencia: pedido.referencia,
        celular: pedido.celular,
        ubigeo: pedido.ubigeo,
        marca: pedido.marca,
        num_cajas: pedido.num_cajas,
        status: 'registrado',
        origen_id: pedido.origen_id,
        destino_id: pedido.destino_id,
        campaign_id: campaign.id,
      }))

      console.log(pedidosInsert)

      // 📌 Insertar pedidos masivamente con createMany
      await Pedido.createMany(pedidosInsert)

      return {
        status: 'success',
        message: 'pedidos deleted successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos no se subieron correctamente',
        error: error,
      }
    }
  }
  public async pedidosMasiveByCampaign({ request }: HttpContext) {
    try {
      const { campaign_id, pedidos } = request.only(['campaign_id', 'pedidos'])

      if (!campaign_id || !Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de pedidos está vacía',
        }
      }
      // 📌 Agregar el ID de la campaña a cada pedido
      const pedidosInsert = pedidos.map((pedido) => ({
        id_solicitante: pedido.id_solicitante,
        nombre_solicitante: pedido.nombre_solicitante,
        direccion: pedido.direccion,
        referencia: pedido.referencia,
        celular: pedido.celular,
        ubigeo: pedido.ubigeo,
        marca: pedido.marca,
        num_cajas: pedido.num_cajas,
        status: 'registrado',
        origen_id: pedido.origen_id,
        destino_id: pedido.destino_id,
        campaign_id: campaign_id,
      }))

      console.log(pedidosInsert)

      // 📌 Insertar pedidos masivamente con createMany
      await Pedido.createMany(pedidosInsert)

      return {
        status: 'success',
        message: 'pedidos deleted successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos no se subieron correctamente',
        error: error,
      }
    }
  }
  public async senDataPedidosCargadaMasive({ request }: HttpContext) {
    try {
      const { pedidos } = request.only(['pedidos'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de pedidos está vacía',
        }
      }
      pedidos.map(async (pedido) => {
        const data = {
          status: 'recepcionado',
        }
        const newData = await Pedido.query().where('id_solicitante', pedido).first()
        if (newData) {
          newData.merge(data)
          await newData.save()
        }
      })
      return {
        status: 'success',
        message: 'pedidos update successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos no se actualizaron correctamente',
        error: error,
      }
    }
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    const pedido = await Pedido.findOrFail(params.id)
    const data = request.only([
      'id_solicitante',
      'nombre_solicitante',
      'direccion',
      'referencia',
      'celular',
      'ubigeo',
      'marca',
      'num_cajas',
      'status',
      'origen_id',
      'destino_id',
    ]) // Asume que estos campos existen
    pedido.merge(data)
    await pedido.save()
    return pedido
  }

  // Eliminar un pedido (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    const pedido = await Pedido.findOrFail(params.id)
    await pedido.delete()
    return { message: 'pedido deleted successfully' }
  }
}
