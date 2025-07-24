import Campaign from '#models/campaign'
import Pedido from '#models/pedido'
import PedidoAsignado from '#models/pedido_asignado'
import PedidoMultimedia from '#models/pedido_multimedia'
import PedidoStatus from '#models/pedido_status'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class PedidosController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    const pedidos = await Pedido.query()
      .preload('origen')
      .preload('destino')
      .preload('status_pedido')
      .preload('multimedia')
      .preload('asignacion', (asignacionQuery) => {
        asignacionQuery.preload('repartidor')
      })
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
      'entrega',
      'org_ventas',
      'fecha_pedido',
      'dni',
      'bulto',
      'empaque',
      'auditoria',
      'mail_plan',
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
  // Crear un nuevo pedido (POST /plans)
  public async entregar({ request }: HttpContext) {
    const { pedido_id } = request.only(['pedido_id']) // Asume que estos campos existen
    try {
      if (!pedido_id) {
        return {
          status: 'error',
          message: 'Faltan el pedido id',
        }
      }
      console.log(pedido_id)
      await PedidoStatus.create({ pedido_id: pedido_id, status: 'entregado' })
      const pedidoData = await Pedido.query().where('id', pedido_id).first()
      if (pedidoData) {
        pedidoData.merge({ status: 'entregado' })
        await pedidoData.save()
      }

      return {
        status: 'success',
        message: 'pedido se entrego successfully',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'pedido no se entrego ni actualizo correctamente',
        error: error,
      }
    }
  }

  public async devolverEntrega({ request }: HttpContext) {
    const { pedido_id } = request.only(['pedido_id'])

    try {
      if (!pedido_id) {
        return {
          status: 'error',
          message: 'Falta el ID del pedido',
        }
      }

      // Eliminar el status entregado de pedidos_status
      await PedidoStatus.query()
        .where('pedido_id', pedido_id)
        .andWhere('status', 'entregado')
        .delete()

      // Buscar el pedido y actualizar el status
      const pedido = await Pedido.query().where('id', pedido_id).first()
      if (pedido) {
        pedido.merge({ status: 'en reparto' })
        await pedido.save()
      }

      return {
        status: 'success',
        message: 'El pedido fue revertido a "en reparto"',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'No se pudo revertir el pedido',
        error: error.message,
      }
    }
  }

  public async pedidosMasive({ request }: HttpContext) {
    try {
      const { campaign_name, cliente, pedidos } = request.only([
        'campaign_name',
        'pedidos',
        'cliente',
      ])

      if (!campaign_name || !Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de pedidos está vacía',
        }
      }
      // 📌 Crear la campaña
      const campaign = await Campaign.create({ name: campaign_name, cliente_id: cliente })
      // 📌 Agregar el ID de la campaña a cada pedido
      const pedidosInsert = pedidos.map((pedido) => ({
        id_solicitante: pedido.id_solicitante,
        entrega: pedido.entrega,
        org_ventas: pedido.org_ventas,
        fecha_pedido: pedido.fecha_pedido,
        dni: pedido.dni,
        bulto: pedido.bulto,
        empaque: pedido.empaque,
        auditoria: pedido.auditoria,
        mail_plan: pedido.mail_plan,
        nombre_solicitante: pedido.nombre_solicitante,
        departamento: pedido.departamento,
        provincia: pedido.provincia,
        distrito: pedido.distrito,
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
  public async pedidosAsignarUser({ request, auth }: HttpContext) {
    await auth.check()

    try {
      const { repartidor_id, pedidos } = request.only(['repartidor_id', 'pedidos'])

      if (!repartidor_id || !Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de pedidos está vacía',
        }
      }

      // Verificamos que todos los pedidos existan antes de continuar
      const pedidosEncontrados = await Pedido.query().whereIn('id', pedidos)

      if (pedidosEncontrados.length !== pedidos.length) {
        const idsEncontrados = pedidosEncontrados.map((p) => p.id)
        const idsFaltantes = pedidos.filter((id) => !idsEncontrados.includes(id))
        return {
          status: 'error',
          message: 'Algunos pedidos no fueron encontrados',
          pedidos_no_encontrados: idsFaltantes,
        }
      }

      // Insertar asignaciones
      const pedidosInsert = pedidos.map((pedidoId) => ({
        repartidor_id,
        pedido_id: pedidoId,
      }))

      await PedidoAsignado.createMany(pedidosInsert)

      // Crear registros en PedidoStatus
      const pedidosStatus = pedidos.map((pedidoId) => ({
        pedido_id: pedidoId,
        status: 'en reparto',
        user_id: auth.user!.id,
        createdAt: DateTime.now().setZone('America/Lima'),
      }))

      await PedidoStatus.createMany(pedidosStatus)

      // Actualizar estado de los pedidos
      for (const pedido of pedidosEncontrados) {
        pedido.status = 'en reparto'
        await pedido.save()
      }

      return {
        status: 'success',
        message: 'Pedidos asignados, actualizados y registrados correctamente',
      }
    } catch (error) {
      console.error('Error al asignar pedidos:', error)

      return {
        status: 'error',
        message: 'Ocurrió un error al asignar los pedidos',
        error: error.message || error,
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
        entrega: pedido.entrega,
        org_ventas: pedido.org_ventas,
        fecha_pedido: pedido.fecha_pedido,
        dni: pedido.dni,
        bulto: pedido.bulto,
        empaque: pedido.empaque,
        auditoria: pedido.auditoria,
        mail_plan: pedido.mail_plan,
        nombre_solicitante: pedido.nombre_solicitante,
        departamento: pedido.departamento,
        provincia: pedido.provincia,
        distrito: pedido.distrito,
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

      // 📌 Insertar pedidos masivamente con createMany
      await Pedido.createMany(pedidosInsert)

      return {
        status: 'success',
        message: 'pedidos subidos successfully',
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        message: 'pedidos no se subieron correctamente',
        error: error,
      }
    }
  }
  public async pedidosUpdateInfoMasive({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const { pedidos } = request.only(['pedidos'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de pedidos está vacía',
        }
      }

      // Actualizar cada pedido correctamente
      for (const pedido of pedidos) {
        const pedidoData = await Pedido.query()
          .where('id_solicitante', pedido.id_solicitante)
          .first()
        if (pedidoData) {
          delete pedido.id
          pedidoData.merge(pedido)
          await pedidoData.save()
        }
      }

      return {
        status: 'success',
        message: 'pedidos completados correctamente',
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        message: 'pedidos no completados correctamente',
        error: error,
      }
    }
  }

  public async pedidosTracking({ request, auth }: HttpContext) {
    await auth.check()
    try {
      const { pedidos, status, fecha } = request.only(['pedidos', 'status', 'fecha'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'Faltan datos o la lista de pedidos está vacía',
        }
      }

      // Verificamos si la fecha fue pasada, y si no, generamos con zona horaria de Perú
      const pedidosStatus = pedidos.map((p) => ({
        pedido_id: p,
        status: status,
        user_id: auth.user!.id,
        createdAt: fecha ? fecha : DateTime.now().setZone('America/Lima'),
      }))

      await PedidoStatus.createMany(pedidosStatus)

      // ✅ Actualización masiva del estado
      await Pedido.query().whereIn('id', pedidos).update({ status })

      return {
        status: 'success',
        message: 'pedidos actualizados correctamente',
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        message: 'pedidos no se actualizaron correctamente',
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

      // Verificamos que todos los pedidos existan antes de continuar
      const pedidosEncontrados = await Pedido.query().whereIn('id', pedidos)

      if (pedidosEncontrados.length !== pedidos.length) {
        const idsEncontrados = pedidosEncontrados.map((p) => p.id)
        const idsFaltantes = pedidos.filter((id) => !idsEncontrados.includes(id))
        return {
          status: 'error',
          message: 'Algunos pedidos no fueron encontrados',
          pedidos_no_encontrados: idsFaltantes,
        }
      }

      // Crear registros en PedidoStatus
      const pedidosStatus = pedidos.map((pedidoId) => ({
        pedido_id: pedidoId,
        status: 'recepcionado',
        user_id: auth.user!.id,
        createdAt: DateTime.now().setZone('America/Lima'),
      }))

      await PedidoStatus.createMany(pedidosStatus)

      // Actualizar estado de los pedidos
      for (const pedido of pedidosEncontrados) {
        pedido.status = 'recepcionado'
        await pedido.save()
      }

      return {
        status: 'success',
        message: 'Pedidos actualizados y registrados en PedidoStatus correctamente',
      }
    } catch (error) {
      console.error('Error al actualizar pedidos:', error)

      return {
        status: 'error',
        message: 'Ocurrió un error al procesar los pedidos',
        error: error.message || error,
      }
    }
  }
  public async senDataPedidosCodes({ request, auth }: HttpContext) {
    await auth.check()

    try {
      const { pedidos, campaign_id } = request.only(['pedidos', 'campaign_id'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de pedidos está vacía',
        }
      }

      // Crear registros en PedidoStatus
      const pedidosCodes = pedidos.map((pedidoCode) => ({
        id_solicitante: pedidoCode,
        status: 'recepcionado',
        campaign_id: campaign_id,
      }))

      await Pedido.createMany(pedidosCodes)
      const pedidosInsertados = await Pedido.query()
        .whereIn('id_solicitante', pedidos)
        .andWhere('campaign_id', campaign_id)
        .orderBy('id', 'desc') // opcional, si deseas ordenarlos

      const pedidosStatus = pedidosInsertados.map((pedido) => ({
        pedido_id: pedido.id,
        status: 'recepcionado',
        user_id: auth.user!.id,
        createdAt: DateTime.now().setZone('America/Lima'),
      }))

      await PedidoStatus.createMany(pedidosStatus)

      return {
        status: 'success',
        message: 'Codigos de Pedidos registrados correctamente',
      }
    } catch (error) {
      console.error('Error al registrar codigos de pedidos:', error)

      return {
        status: 'error',
        message: 'Ocurrió un error al procesar los pedidos',
        error: error.message || error,
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
        createdAt: DateTime.now().setZone('America/Lima'),
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
        createdAt: DateTime.now().setZone('America/Lima'),
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
        createdAt: DateTime.now().setZone('America/Lima'),
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
        'entrega',
        'org_ventas',
        'fecha_pedido',
        'dni',
        'bulto',
        'empaque',
        'auditoria',
        'mail_plan',
        'nombre_solicitante',
        'departamento',
        'provincia',
        'distrito',
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

  public async deleteMultimediaMasive({ request }: HttpContext) {
    try {
      const { pedidos } = request.only(['pedidos'])

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return {
          status: 'error',
          message: 'La lista de archivos multimedia está vacía',
        }
      }

      // 📌 Extraer las URLs directamente del array
      const urlsToDelete = pedidos
        .map((item) => item.url)
        .filter((url): url is string => typeof url === 'string' && url.trim() !== '')

      if (urlsToDelete.length === 0) {
        return {
          status: 'error',
          message: 'No se encontraron URLs válidas para eliminar',
        }
      }

      // 📌 Eliminar de la base de datos por URL
      const deletedCount = await PedidoMultimedia.query().whereIn('url', urlsToDelete).delete()

      return {
        status: 'success',
        message: `Se eliminaron correctamente ${deletedCount} archivos multimedia`,
      }
    } catch (error) {
      console.error('Error al eliminar multimedia:', error)
      return {
        status: 'error',
        message: 'Ocurrió un error al eliminar los archivos multimedia',
        error: error.message,
      }
    }
  }
}
