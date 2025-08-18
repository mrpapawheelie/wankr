import { RegisterService, RegisterEntry } from './register';

export class CheckRegisterService {
  private registerService: RegisterService;

  constructor(registerService: RegisterService) {
    this.registerService = registerService;
  }

  /**
   * Fast register check for a single address
   * Returns null if not found or expired
   */
  checkRegister(address: string): RegisterEntry | null {
    return this.registerService.checkRegister(address);
  }

  /**
   * Fast bulk register check for multiple addresses
   * Returns object with address -> RegisterEntry mapping
   */
  checkRegisterBulk(addresses: string[]): { [address: string]: RegisterEntry | null } {
    return this.registerService.checkRegisterBulk(addresses);
  }

  /**
   * Get register statistics
   */
  getRegisterStats() {
    return this.registerService.getRegisterStats();
  }
}
