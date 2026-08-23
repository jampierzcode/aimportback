import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Crea cuentas de prueba para repartidor y cliente (+ una sede y un
 * registro de cliente), para poder probar esas vistas localmente.
 *
 * Uso:
 *   node ace seed:demo-accounts
 */
export default class SeedDemoAccounts extends BaseCommand {
  static commandName = 'seed:demo-accounts'
  static description = 'Crea cuentas de prueba de repartidor y cliente'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { default: Role } = await import('#models/role')
    const { default: User } = await import('#models/user')
    const { default: Sede } = await import('#models/sede')
    const { default: Cliente } = await import('#models/cliente')

    // 📌 Sede de prueba
    const sede = await Sede.firstOrCreate(
      { name_referential: 'Almacén Central' },
      {
        name_referential: 'Almacén Central',
        direction: 'Av. Principal 123',
        department: 'Lima',
        province: 'Lima',
        district: 'San Isidro',
      }
    )

    // 📌 Repartidor
    const rolRepartidor = await Role.firstOrCreate(
      { name: 'repartidor' },
      { name: 'repartidor' }
    )
    const repartidorEmail = 'repartidor@aimportcargo.local'
    const repartidorPassword = 'Repartidor123'
    let repartidor = await User.findBy('email', repartidorEmail)
    if (repartidor) {
      repartidor.password = repartidorPassword
      repartidor.rol_id = rolRepartidor.id
      repartidor.sede_id = sede.id
      await repartidor.save()
    } else {
      repartidor = await User.create({
        name: 'Repartidor Demo',
        email: repartidorEmail,
        password: repartidorPassword,
        rol_id: rolRepartidor.id,
        sede_id: sede.id,
      })
    }

    // 📌 Cliente (usuario + registro en tabla clientes)
    const rolCliente = await Role.firstOrCreate({ name: 'cliente' }, { name: 'cliente' })
    const clienteEmail = 'cliente@aimportcargo.local'
    const clientePassword = 'Cliente123'
    let clienteUser = await User.findBy('email', clienteEmail)
    if (clienteUser) {
      clienteUser.password = clientePassword
      clienteUser.rol_id = rolCliente.id
      await clienteUser.save()
    } else {
      clienteUser = await User.create({
        name: 'Cliente Demo',
        email: clienteEmail,
        password: clientePassword,
        rol_id: rolCliente.id,
      })
    }

    await Cliente.firstOrCreate(
      { usuario_id: clienteUser.id },
      {
        usuario_id: clienteUser.id,
        razon_social: 'Cliente Demo SAC',
        ruc: '20123456789',
        direccion: 'Av. Los Clientes 456',
      }
    )

    this.logger.success('Cuentas de prueba listas:')
    this.logger.info(`  Repartidor: ${repartidorEmail} / ${repartidorPassword}`)
    this.logger.info(`  Cliente:    ${clienteEmail} / ${clientePassword}`)
  }
}
