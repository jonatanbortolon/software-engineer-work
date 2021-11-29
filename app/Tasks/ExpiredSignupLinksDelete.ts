import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import SignupLink from 'App/Models/SignupLink'
import { DateTime } from 'luxon'

export default class ExpiredLinksDelete extends BaseTask {
  public static get schedule() {
    return '00 08,16 * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    try {
      Logger.info('Task ExpiredLinksDelete started!')

      await SignupLink.query().where('created_at', '<', DateTime.now().toISO()).delete()

      Logger.info('Task ExpiredLinksDelete success!')
    } catch (e) {
      Logger.error('Task ExpiredLinksDelete failed with:', e)
    }
  }
}
