export class InsufficientCreditsError extends Error {
  constructor(public currentCredits: number, public requiredCredits: number) {
    super(`Insufficient credits. Need ${requiredCredits}, have ${currentCredits}`);
    this.name = 'InsufficientCreditsError';
  }
}