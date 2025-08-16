import { ethers } from 'ethers';

export interface NetMessage {
  app: string;
  sender: string;
  timestamp: bigint;
  data: string;
  text: string;
  topic: string;
}

export interface ShameMessage {
  from: string;
  to: string;
  amount: string;
  reason: string;
  timestamp: number;
  messageIndex: number;
}

export class NetProtocolService {
  private provider: ethers.JsonRpcProvider;
  private netContract: ethers.Contract;
  private readonly NET_CONTRACT_ADDRESS = '0x00000000b24d62781db359b07880a105cd0b64e6';
  private readonly WANKR_APP_ADDRESS = '0xa207c6e67cea08641503947ac05c65748bb9bb07'; // WANKR contract as app

  constructor(rpcUrl: string = 'https://mainnet.base.org') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.netContract = new ethers.Contract(this.NET_CONTRACT_ADDRESS, this.getNetABI(), this.provider);
  }

  /**
   * Get Net Protocol ABI for message reading
   */
  private getNetABI() {
    return [
      {
        type: "function",
        name: "getMessage",
        inputs: [{ name: "idx", type: "uint256", internalType: "uint256" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct INet.Message",
            components: [
              { name: "app", type: "address", internalType: "address" },
              { name: "sender", type: "address", internalType: "address" },
              { name: "timestamp", type: "uint256", internalType: "uint256" },
              { name: "data", type: "bytes", internalType: "bytes" },
              { name: "text", type: "string", internalType: "string" },
              { name: "topic", type: "string", internalType: "string" },
            ],
          },
        ],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getTotalMessagesForAppCount",
        inputs: [{ name: "app", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getMessageForApp",
        inputs: [
          { name: "app", type: "address", internalType: "address" },
          { name: "idx", type: "uint256", internalType: "uint256" }
        ],
        outputs: [
          {
            name: "",
            type: "tuple",
            internalType: "struct INet.Message",
            components: [
              { name: "app", type: "address", internalType: "address" },
              { name: "sender", type: "address", internalType: "address" },
              { name: "timestamp", type: "uint256", internalType: "uint256" },
              { name: "data", type: "bytes", internalType: "bytes" },
              { name: "text", type: "string", internalType: "string" },
              { name: "topic", type: "string", internalType: "string" },
            ],
          },
        ],
        stateMutability: "view",
      }
    ];
  }

  /**
   * Get total number of WANKR shame messages
   */
  async getWANKRMessageCount(): Promise<number> {
    try {
      const count = await this.netContract.getTotalMessagesForAppCount(this.WANKR_APP_ADDRESS);
      return Number(count);
    } catch (error) {
      console.error('Error getting WANKR message count:', error);
      return 0;
    }
  }

  /**
   * Get recent WANKR shame messages
   */
  async getRecentWANKRMessages(limit: number = 20): Promise<ShameMessage[]> {
    try {
      const totalCount = await this.getWANKRMessageCount();
      if (totalCount === 0) return [];

      const messages: ShameMessage[] = [];
      const startIndex = Math.max(0, totalCount - limit);

      for (let i = startIndex; i < totalCount; i++) {
        try {
          const message = await this.netContract.getMessageForApp(this.WANKR_APP_ADDRESS, i);
          
          // Parse shame message from Net Protocol
          const shameMessage = this.parseShameMessage(message, i);
          if (shameMessage) {
            messages.push(shameMessage);
          }
        } catch (error) {
          console.log(`Error reading message ${i}:`, error);
          continue;
        }
      }

      return messages.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting recent WANKR messages:', error);
      return [];
    }
  }

  /**
   * Parse Net Protocol message into shame message format
   */
  private parseShameMessage(message: NetMessage, index: number): ShameMessage | null {
    try {
      // Parse the message text to extract shame information
      // Expected format: "sent X WANKR to @recipient" or similar
      const shamePatterns = [
        /sent (\d+) WANKR to @(\w+)/i,
        /delivered (\d+) WANKR shame to @(\w+)/i,
        /sent (\d+) \$?WANKR to @(\w+)/i
      ];

      for (const pattern of shamePatterns) {
        const match = message.text.match(pattern);
        if (match) {
          const [, amount, recipient] = match;
          const amountNum = parseInt(amount);
          
          // Only process amounts 1-1000
          if (amountNum >= 1 && amountNum <= 1000) {
            return {
              from: message.sender,
              to: recipient, // This would need to be resolved to wallet address
              amount: amount,
              reason: 'Shame delivered via Net Protocol',
              timestamp: Number(message.timestamp),
              messageIndex: index
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing shame message:', error);
      return null;
    }
  }

  /**
   * Send a shame message to Net Protocol
   * This would be used when someone delivers shame via BankrBot
   */
  async sendShameMessage(
    sender: string,
    recipient: string,
    amount: string,
    reason: string,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const messageText = `sent ${amount} WANKR to @${recipient} - ${reason}`;
      const topic = 'wankr-shame';
      const data = ethers.toUtf8Bytes(JSON.stringify({
        sender,
        recipient,
        amount,
        reason,
        timestamp: Date.now()
      }));

      const contractWithSigner = this.netContract.connect(signer);
      const tx = await contractWithSigner.sendMessageViaApp(
        sender,
        messageText,
        topic,
        data
      );

      const receipt = await tx.wait();
      console.log('Shame message sent to Net Protocol:', receipt.transactionHash);
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error sending shame message to Net Protocol:', error);
      throw error;
    }
  }

  /**
   * Get shame statistics from Net Protocol
   */
  async getShameStats(): Promise<{
    totalMessages: number;
    recentMessages: number;
    uniqueSenders: number;
    totalAmount: string;
  }> {
    try {
      const totalMessages = await this.getWANKRMessageCount();
      const recentMessages = await this.getRecentWANKRMessages(50);
      
      const uniqueSenders = new Set(recentMessages.map(m => m.from)).size;
      const totalAmount = recentMessages
        .reduce((sum, m) => sum + parseInt(m.amount), 0)
        .toString();

      return {
        totalMessages,
        recentMessages: recentMessages.length,
        uniqueSenders,
        totalAmount
      };
    } catch (error) {
      console.error('Error getting shame stats:', error);
      return {
        totalMessages: 0,
        recentMessages: 0,
        uniqueSenders: 0,
        totalAmount: '0'
      };
    }
  }

  /**
   * Monitor Net Protocol for new shame messages
   */
  async monitorShameMessages(callback: (message: ShameMessage) => void): Promise<void> {
    try {
      console.log('Starting Net Protocol shame message monitoring...');
      
      // Monitor for new messages
      this.netContract.on('MessageSentViaApp', async (app: string, sender: string, topic: string, messagesLength: bigint) => {
        if (app.toLowerCase() === this.WANKR_APP_ADDRESS.toLowerCase() && topic === 'wankr-shame') {
          try {
            const messageIndex = Number(messagesLength) - 1;
            const message = await this.netContract.getMessageForApp(this.WANKR_APP_ADDRESS, messageIndex);
            const shameMessage = this.parseShameMessage(message, messageIndex);
            
            if (shameMessage) {
              callback(shameMessage);
            }
          } catch (error) {
            console.error('Error processing new shame message:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error starting Net Protocol monitoring:', error);
    }
  }
}
