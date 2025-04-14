import Sede from '#models/sede'
import type { HttpContext } from '@adonisjs/core/http'

export default class SedesController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    try {
      const sedes = await Sede.all()

      return {
        status: 'success',
        message: 'sedes fetched with success',
        data: sedes,
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
      const sede = await Sede.findOrFail(params.id)
      console.log(sede)

      return {
        status: 'success',
        message: 'sede fetched with success',
        data: sede,
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
  public async store({ request }: HttpContext) {
    try {
      const data = request.only([
        'name_referential',
        'direction',
        'department',
        'province',
        'district',
      ]) // Asume que estos campos existen
      const sede = await Sede.create(data)

      return {
        status: 'success',
        message: 'course saved with success',
        data: sede,
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
      const sede = await Sede.findOrFail(params.id)
      const data = request.only([
        'name_referential',
        'direction',
        'department',
        'province',
        'district',
      ]) // Asume que estos campos existen
      sede.merge(data)
      await sede.save()

      return {
        status: 'success',
        message: 'courses fetched with success',
        data: sede,
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
      const sede = await Sede.findOrFail(params.id)
      await sede.delete()
      return {
        status: 'success',
        message: 'course deleted successfully',
        data: sede,
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
