import CourseCategory from '#models/course_category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CoursesCategoriesController {
  // Crear un nuevo course (POST /plans)
  public async store({ auth, request }: HttpContext) {
    try {
      await auth.check()
      const data = request.only(['categories']) // Asume que estos campos existen
      console.log(data)
      if (data.categories && Array.isArray(data.categories)) {
        await CourseCategory.createMany(data.categories) // Guardar las asociaciones en la tabla intermedia
      }
      return {
        status: 'success',
        message: 'course saved with success',
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error saved course',
        error: error,
      }
    }
  }
}
