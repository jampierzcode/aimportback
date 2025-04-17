import Campaign from '#models/campaign'
import Pedido from '#models/pedido'
import PedidoAsignado from '#models/pedido_asignado'
import PedidoMultimedia from '#models/pedido_multimedia'
import PedidoStatus from '#models/pedido_status'
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
      .preload('status_pedido')
      .preload('multimedia')
      .first()
    console.log(pedido)
    return pedido
  }
  public async pedidoByRepartidor({ params }: HttpContext) {
    console.log(params)
    const pedidos = await PedidoAsignado.query()
      .where('repartidor_id', params.id)
      .preload('pedido', (pedidoQuery) => {
        pedidoQuery.preload('origen').preload('destino').preload('multimedia')
      })
    console.log(pedidos)
    return pedidos
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
  public async pedidosMultimedia({ request }: HttpContext) {
    try {
      const { files, pedido_id } = request.only(['pedido_id', 'files'])

      if (!pedido_id || !Array.isArray(files) || files.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de imagenes está vacía',
        }
      }
      // 📌 Agregar el ID de la campaña a cada pedido
      const pedidosMultimedia = files.map((file) => ({
        pedido_id: pedido_id,
        url: file.url,
        type: 'image',
      }))

      // 📌 Insertar pedidos masivamente con createMany
      await PedidoMultimedia.createMany(pedidosMultimedia)

      return {
        status: 'success',
        message: 'pedidos multimedia successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos multimedia no se subieron correctamente',
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
  public async senDataPedidosCargadaMasive({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const { pedidos } = request.only(['pedidos'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de pedidos está vacía',
        }
      }
      const pedidosStatus = pedidos.map((p) => ({
        pedido_id: p,
        status: 'recepcionado',
        user_id: auth.user!.id,
      }))

      await PedidoStatus.createMany(pedidosStatus) // Guardar las asociaciones en la tabla intermedia

      // Actualizar cada pedido correctamente
      for (const pedido of pedidos) {
        const pedidoData = await Pedido.query().where('id_solicitante', pedido).first()
        if (pedidoData) {
          pedidoData.merge({ status: 'recepcionado' })
          await pedidoData.save()
        }
      }
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
  public async senDataPedidosEnCaminoMasive({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const { pedidos } = request.only(['pedidos'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de pedidos está vacía',
        }
      }
      const pedidosStatus = pedidos.map((p) => ({
        pedido_id: p,
        status: 'en camino',
        user_id: auth.user!.id,
      }))

      await PedidoStatus.createMany(pedidosStatus) // Guardar las asociaciones en la tabla intermedia
      // Actualizar cada pedido correctamente
      for (const pedido of pedidos) {
        const pedidoData = await Pedido.query().where('id_solicitante', pedido).first()
        if (pedidoData) {
          pedidoData.merge({ status: 'en camino' })
          await pedidoData.save()
        }
      }

      return {
        status: 'success',
        message: 'pedidos en camino update successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos no se actualizaron correctamente',
        error: error,
      }
    }
  }
  public async senDataPedidosEnAlmacenMasive({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const { pedidos } = request.only(['pedidos'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de pedidos está vacía',
        }
      }
      const pedidosStatus = pedidos.map((p) => ({
        pedido_id: p,
        status: 'en almacen',
        user_id: auth.user!.id,
      }))

      await PedidoStatus.createMany(pedidosStatus) // Guardar las asociaciones en la tabla intermedia

      // Actualizar cada pedido correctamente
      for (const pedido of pedidos) {
        const pedidoData = await Pedido.query().where('id_solicitante', pedido).first()
        if (pedidoData) {
          pedidoData.merge({ status: 'en almacen' })
          await pedidoData.save()
        }
      }
      return {
        status: 'success',
        message: 'pedidos en camino update successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos no se actualizaron correctamente',
        error: error,
      }
    }
  }
  public async senDataPedidosEnRepartoMasive({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const { pedidos, repartidor_id } = request.only(['pedidos', 'repartidor_id'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de pedidos está vacía',
        }
      }
      const pedidosStatus = pedidos.map((p) => ({
        pedido_id: p,
        status: 'en reparto',
        user_id: auth.user!.id,
      }))

      await PedidoStatus.createMany(pedidosStatus) // Guardar las asociaciones en la tabla intermedia
      const pedidosAsignados = pedidos.map((p) => ({
        pedido_id: p,
        repartidor_id: repartidor_id,
      }))

      await PedidoAsignado.createMany(pedidosAsignados) // Guardar las asociaciones en la tabla intermedia

      // Actualizar cada pedido correctamente
      for (const pedido of pedidos) {
        const pedidoData = await Pedido.query().where('id_solicitante', pedido).first()
        if (pedidoData) {
          pedidoData.merge({ status: 'en reparto' })
          await pedidoData.save()
        }
      }
      return {
        status: 'success',
        message: 'pedidos en camino update successfully',
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
    try {
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

      return {
        status: 'success',
        message: 'pedidos multimedia update successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedidos multimedia no se actualizaron correctamente',
        error: error,
      }
    }
  }

  // Eliminar un pedido (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    const pedido = await Pedido.findOrFail(params.id)
    await pedido.delete()
    return { message: 'pedido deleted successfully' }
  }
}
