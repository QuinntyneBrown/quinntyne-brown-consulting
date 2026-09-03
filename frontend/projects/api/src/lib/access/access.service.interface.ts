import { AccessToken } from '../models/access-token';

export interface IAccessService {
  unlock(passcode: string): Promise<AccessToken>;
}
