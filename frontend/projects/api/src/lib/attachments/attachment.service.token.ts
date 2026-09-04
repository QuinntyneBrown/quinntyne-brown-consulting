import { InjectionToken } from '@angular/core';
import { IAttachmentService } from './attachment.service.interface';

export const ATTACHMENT_SERVICE = new InjectionToken<IAttachmentService>('ATTACHMENT_SERVICE');
