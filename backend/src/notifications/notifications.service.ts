import { Injectable } from '@nestjs/common';
@Injectable()
export class NotificationsService {
  async sendEmailVerification(email: string, name: string, token: string): Promise<void> {
    console.log('[EMAIL] Verification to ' + email);
  }
  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    console.log('[EMAIL] Password reset to ' + email);
  }
  async sendPushNotification(tokens: string[], title: string, body: string): Promise<void> {
    console.log('[PUSH] ' + title);
  }
}
