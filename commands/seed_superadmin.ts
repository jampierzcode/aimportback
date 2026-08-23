import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Crea (o actualiza la contraseña de) un usuario con rol "superadmin".
 * Pensado para levantar rápido una cuenta con la que probar el sistema
 * en un entorno local.
 *
 * Uso:
 *   node ace seed:superadmin
 *   node ace seed:superadmin --email=otro@correo.com --password=OtraClave123
 */
export default class SeedSuperadmin extends BaseCommand {
  static commandName = 'seed:superadmin'
  static description = 'Crea un usuario superadmin para pruebas locales'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Email del usuario a crear' })
  declare email: string

  @flags.string({ description: 'Contraseña del usuario a crear' })
  declare password: string

  async run() {
    const { default: Role } = await import('#models/role')
    const { default: User } = await import('#models/user')

    const email = this.email || 'admin@aimportcargo.local'
    const password = this.password || 'Admin12345'

    const role = await Role.firstOrCreate({ name: 'superadmin' }, { name: 'superadmin' })

    const existing = await User.findBy('email', email)

    if (existing) {
      existing.password = password
      existing.rol_id = role.id
      await existing.save()
      this.logger.success(`Usuario actualizado: ${email}`)
    } else {
      await User.create({
        name: 'Super Admin',
        email,
        password,
        rol_id: role.id,
      })
      this.logger.success(`Usuario creado: ${email}`)
    }

    this.logger.info(`Contraseña: ${password}`)
  }
}
