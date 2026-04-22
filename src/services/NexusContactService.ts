export interface SovereignContact {
  did: string;
  sharedKey: string;
  convId: string;
  name: string;
  addedAt: number;
  isGroup: false;
  online: boolean;
  lastCiphertext: string;
  timestamp: string;
  unreadCount: number;
}

export class NexusContactService {
  private static STORAGE_KEY = 'NEXUS_SOVEREIGN_CONTACTS';
  private static UPDATE_EVENT = 'nexus_contacts_updated';

  static buildDeterministicConvId(nodeA: string, nodeB: string) {
    const sorted = [nodeA, nodeB].sort();
    return `p2p_${sorted[0]}_${sorted[1]}`;
  }

  static saveContactLocally(contactData: { did: string; sharedKey: string; convId: string }) {
    if (typeof window === 'undefined') return false;
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      const contacts: SovereignContact[] = existingData ? JSON.parse(existingData) : [];

      const existingIndex = contacts.findIndex((contact) => contact.did === contactData.did);
      const newContact: SovereignContact = {
        ...contactData,
        name: `节点 ${contactData.did.slice(-4)}`,
        addedAt: Date.now(),
        isGroup: false,
        online: true,
        lastCiphertext: 'Sovereign link established.',
        timestamp: 'NOW',
        unreadCount: 0
      };

      if (existingIndex > -1) {
        contacts[existingIndex] = { ...contacts[existingIndex], ...newContact };
      } else {
        contacts.push(newContact);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
      window.dispatchEvent(new Event(this.UPDATE_EVENT));
      return true;
    } catch (error) {
      console.error('[NEXUS] Local contact storage failure:', error);
      return false;
    }
  }

  static getLocalContacts(): SovereignContact[] {
    if (typeof window === 'undefined') return [];
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      return existingData ? JSON.parse(existingData) : [];
    } catch (error) {
      return [];
    }
  }

  static getUpdateEventName() {
    return this.UPDATE_EVENT;
  }
}
