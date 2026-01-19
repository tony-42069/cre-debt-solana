import { Connection, PublicKey, AccountInfo, Parser, IdlEvents } from '@solana/web3.js';
import { LoanCore } from '../types/loan-core';
import { PropertyRegistry } from '../types/property-registry';
import { BorrowerRegistry } from '../types/borrower-registry';

export interface BlockchainEvent {
  programId: string;
  eventName: string;
  data: Record<string, unknown>;
  slot: number;
  timestamp: number;
  signature: string;
}

export interface EventHandlerConfig {
  connection: Connection;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  webhookUrl?: string;
  eventCallbacks?: Partial<Record<string, (event: BlockchainEvent) => void>>;
}

export class BlockchainEventListener {
  private connection: Connection;
  private commitment: 'processed' | 'confirmed' | 'finalized';
  private webhookUrl?: string;
  private eventCallbacks: Partial<Record<string, (event: BlockchainEvent) => void>>;
  private programIds: PublicKey[] = [];
  private subscriptionIds: number[] = [];
  private isRunning: boolean = false;

  constructor(config: EventHandlerConfig) {
    this.connection = config.connection;
    this.commitment = config.commitment || 'confirmed';
    this.webhookUrl = config.webhookUrl;
    this.eventCallbacks = config.eventCallbacks || {};
  }

  addProgram(programId: string, idl?: object) {
    this.programIds.push(new PublicKey(programId));
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Event listener already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting blockchain event listener...');

    for (const programId of this.programIds) {
      const subscriptionId = this.connection.onProgramAccountChange(
        programId,
        (accountInfo, context) => {
          this.handleAccountChange(programId, accountInfo, context);
        },
        this.commitment
      );

      this.subscriptionIds.push(subscriptionId);
      console.log(`Subscribed to program: ${programId.toString()}`);
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    for (const subscriptionId of this.subscriptionIds) {
      await this.connection.removeProgramAccountChangeListener(subscriptionId);
    }

    this.subscriptionIds = [];
    console.log('Blockchain event listener stopped');
  }

  private async handleAccountChange(
    programId: PublicKey,
    accountInfo: AccountInfo<Buffer>,
    context: any
  ) {
    try {
      const events = this.parseEvents(programId, accountInfo.data);

      for (const event of events) {
        await this.handleEvent(event);
      }
    } catch (error) {
      console.error('Error handling account change:', error);
    }
  }

  private parseEvents(programId: PublicKey, data: Buffer): BlockchainEvent[] {
    const events: BlockchainEvent[] = [];
    const programIdStr = programId.toString();

    if (programIdStr === 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE') {
      events.push(...this.parseLoanCoreEvents(data));
    } else if (programIdStr === 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS') {
      events.push(...this.parsePropertyRegistryEvents(data));
    } else if (programIdStr === '8g6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnU') {
      events.push(...this.parseBorrowerRegistryEvents(data));
    }

    return events;
  }

  private parseLoanCoreEvents(data: Buffer): BlockchainEvent[] {
    const events: BlockchainEvent[] = [];
    const eventPrefix = data.slice(0, 8).toString('hex');

    if (eventPrefix === 'd28e2a4c') {
      events.push({
        programId: 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE',
        eventName: 'LoanCreatedEvent',
        data: this.decodeLoanCreatedEvent(data),
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    } else if (eventPrefix === 'e1b3b5e2') {
      events.push({
        programId: 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE',
        eventName: 'LoanApprovedEvent',
        data: this.decodeLoanApprovedEvent(data),
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    } else if (eventPrefix === 'f4a8c1d3') {
      events.push({
        programId: 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE',
        eventName: 'LoanFundedEvent',
        data: this.decodeLoanFundedEvent(data),
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    } else if (eventPrefix === 'a7b9d4e5') {
      events.push({
        programId: 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE',
        eventName: 'PaymentProcessedEvent',
        data: this.decodePaymentProcessedEvent(data),
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    } else if (eventPrefix === 'c2e8f6a1') {
      events.push({
        programId: 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE',
        eventName: 'LoanDelinquentEvent',
        data: this.decodeLoanDelinquentEvent(data),
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    } else if (eventPrefix === 'd9a4b7c2') {
      events.push({
        programId: 'H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE',
        eventName: 'LoanDefaultedEvent',
        data: this.decodeLoanDefaultedEvent(data),
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    }

    return events;
  }

  private parsePropertyRegistryEvents(data: Buffer): BlockchainEvent[] {
    const events: BlockchainEvent[] = [];
    const eventPrefix = data.slice(0, 8).toString('hex');

    if (eventPrefix === 'e5f8a2b3') {
      events.push({
        programId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
        eventName: 'PropertyVerifiedEvent',
        data: { verified: true },
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    }

    return events;
  }

  private parseBorrowerRegistryEvents(data: Buffer): BlockchainEvent[] {
    const events: BlockchainEvent[] = [];
    const eventPrefix = data.slice(0, 8).toString('hex');

    if (eventPrefix === 'a1b2c3d4') {
      events.push({
        programId: '8g6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnU',
        eventName: 'BorrowerRegisteredEvent',
        data: { registered: true },
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    } else if (eventPrefix === 'b2c3d4e5') {
      events.push({
        programId: '8g6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnU',
        eventName: 'KycStatusUpdatedEvent',
        data: { kycUpdated: true },
        slot: 0,
        timestamp: Date.now() / 1000,
        signature: '',
      });
    }

    return events;
  }

  private decodeLoanCreatedEvent(data: Buffer): Record<string, unknown> {
    return {
      loanId: data.slice(8, 44).toString('utf8').replace(/\0/g, ''),
      borrower: new PublicKey(data.slice(44, 76)).toString(),
      principalAmount: Number(data.readBigUInt64LE(76)),
      createdAt: Number(data.readBigInt64LE(84)),
    };
  }

  private decodeLoanApprovedEvent(data: Buffer): Record<string, unknown> {
    return {
      loanId: data.slice(8, 44).toString('utf8').replace(/\0/g, ''),
      approvedAt: Number(data.readBigInt64LE(44)),
    };
  }

  private decodeLoanFundedEvent(data: Buffer): Record<string, unknown> {
    return {
      loanId: data.slice(8, 44).toString('utf8').replace(/\0/g, ''),
      fundedAt: Number(data.readBigInt64LE(44)),
      disbursementAmount: Number(data.readBigUInt64LE(52)),
      originationFee: Number(data.readBigUInt64LE(60)),
    };
  }

  private decodePaymentProcessedEvent(data: Buffer): Record<string, unknown> {
    return {
      loanId: data.slice(8, 44).toString('utf8').replace(/\0/g, ''),
      paymentAmount: Number(data.readBigUInt64LE(44)),
      principalPortion: Number(data.readBigUInt64LE(52)),
      interestPortion: Number(data.readBigUInt64LE(60)),
      remainingPrincipal: Number(data.readBigUInt64LE(68)),
      paymentDate: Number(data.readBigInt64LE(76)),
    };
  }

  private decodeLoanDelinquentEvent(data: Buffer): Record<string, unknown> {
    return {
      loanId: data.slice(8, 44).toString('utf8').replace(/\0/g, ''),
      delinquentAt: Number(data.readBigInt64LE(44)),
      nextPaymentDue: Number(data.readBigInt64LE(52)),
    };
  }

  private decodeLoanDefaultedEvent(data: Buffer): Record<string, unknown> {
    return {
      loanId: data.slice(8, 44).toString('utf8').replace(/\0/g, ''),
      defaultedAt: Number(data.readBigInt64LE(44)),
      remainingPrincipal: Number(data.readBigUInt64LE(52)),
    };
  }

  private async handleEvent(event: BlockchainEvent): Promise<void> {
    console.log(`Received event: ${event.eventName}`, event.data);

    const callback = this.eventCallbacks[event.eventName];
    if (callback) {
      callback(event);
    }

    if (this.webhookUrl) {
      await this.sendWebhook(event);
    }
  }

  private async sendWebhook(event: BlockchainEvent): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error('Webhook failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  on(eventName: string, callback: (event: BlockchainEvent) => void) {
    this.eventCallbacks[eventName] = callback;
  }

  off(eventName: string) {
    delete this.eventCallbacks[eventName];
  }
}

export async function createEventListener(
  rpcUrl: string,
  config?: Partial<EventHandlerConfig>
): Promise<BlockchainEventListener> {
  const connection = new Connection(rpcUrl, 'confirmed');
  const listener = new BlockchainEventListener({
    connection,
    ...config,
  });

  listener.addProgram('H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE');
  listener.addProgram('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
  listener.addProgram('8g6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnU');

  return listener;
}
