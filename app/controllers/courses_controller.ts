import Course from '#models/course'
import type { HttpContext } from '@adonisjs/core/http'

export default class CoursesController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    try {
      const courses = await Course.query().preload('categories')
      return {
        status: 'success',
        message: 'courses fetched with success',
        data: courses,
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
      const course = await Course.query().preload('categories').where('id', params.id).first()
      console.log(course)

      return {
        status: 'success',
        message: 'courses fetched with success',
        data: course,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'courses fetched with error',
        error: error,
      }
    }
  }

  // Crear un nuevo course (POST /plans)
  public async store({ auth, request }: HttpContext) {
    try {
      await auth.check()
      const data = request.only(['title', 'description', 'duration', 'thumbnail']) // Asume que estos campos existen
      console.log(data)
      const newCourse = { ...data, instructor_id: auth.user?.id }

      const course = await Course.create(newCourse)
      return {
        status: 'success',
        message: 'course saved with success',
        data: course,
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
      const course = await Course.findOrFail(params.id)
      const data = request.only([`name`, 'description'])
      course.merge(data)
      await course.save()
      return {
        status: 'success',
        message: 'courses fetched with success',
        data: course,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'courses fetched with error',
        error: error,
      }
    }
  }

  // Eliminar un course (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    try {
      const course = await Course.findOrFail(params.id)
      await course.delete()
      return {
        status: 'success',
        message: 'course deleted successfully',
        data: course,
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
