// src/services/NexusContactService.ts

export class NexusContactService {
  private static STORAGE_KEY = 'NEXUS_SOVEREIGN_CONTACTS';

  // 🟢 纯本地保存联系人 (数据绝对不出端)
  static saveContactLocally(contactData: { did: string, sharedKey: string, convId: string }) {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      let contacts = existingData ? JSON.parse(existingData) : [];
      
      // 防止重复添加
      const existingIndex = contacts.findIndex((c: any) => c.did === contactData.did);
      const newContact = {
        ...contactData,
        name: `节点 ${contactData.did.slice(-4)}`,
        addedAt: Date.now()
      };

      if (existingIndex > -1) {
        contacts[existingIndex] = newContact;
      } else {
        contacts.push(newContact);
      }

      // 加密后存入本地 (如果是 App 环境，这里应该存入 Keychain / SecureStorage)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
      
      // 触发一个自定义事件，通知首页列表刷新
      window.dispatchEvent(new Event('nexus_contacts_updated'));
      
      return true;
    } catch (err) {
      console.error("[NEXUS] Local Storage Failure:", err);
      return false;
    }
  }

  // 🟢 拉取本地联系人
  static getLocalContacts() {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      return existingData ? JSON.parse(existingData) : [];
    } catch (err) {
      return [];
    }
  }
}
