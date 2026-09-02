/**
 * ============================================================================
 * Fayzar Computer v2 - AI OCR Secure Configuration & Key Vault
 * ============================================================================
 * This file securely manages the AI OCR engine credentials and fallback keys.
 * Keys are dynamically deobfuscated at runtime to prevent casual source inspection.
 * ============================================================================
 */

(function (global) {
  'use strict';

  // Obfuscated credential vault (XOR bit-shifted + Base64 encoded)
  const VAULT = {
    PRIMARY: 'a3sEa0gSeGQcYXBpZ1lMex4HWGJhfW8SHnUdW1pbUk1tYXpmGUZSGXtQb1prQVMSB2BEHU0=',
    BACKUP: 'a2NQS3lTaU9NUElzQ2d1bUleaWl8Xlh8Z2ZAfW9zbEIfZVNae0Zd',
    MASK_SALT: 42
  };

  /**
   * Internal string deobfuscator
   */
  function _unpack(encodedStr, salt = VAULT.MASK_SALT) {
    if (!encodedStr) return '';
    try {
      const raw = typeof atob === 'function' ? atob(encodedStr) : Buffer.from(encodedStr, 'base64').toString('binary');
      const chars = [];
      for (let i = 0; i < raw.length; i++) {
        chars.push(String.fromCharCode(raw.charCodeAt(i) ^ salt));
      }
      return chars.join('');
    } catch (e) {
      console.warn('Vault deobfuscation failed:', e);
      return '';
    }
  }

  const FayzarOcrConfig = {
    /**
     * Get Primary Default API Key
     */
    getPrimaryApiKey: function () {
      return _unpack(VAULT.PRIMARY);
    },

    /**
     * Get Secondary Fallback Backup API Key
     */
    getBackupApiKey: function () {
      return _unpack(VAULT.BACKUP);
    },

    /**
     * Get all active system keys in priority order
     */
    getAllSystemKeys: function () {
      const primary = this.getPrimaryApiKey();
      const backup = this.getBackupApiKey();
      const keys = [];
      if (primary) keys.push(primary);
      if (backup && backup !== primary) keys.push(backup);
      return keys;
    },

    /**
     * Resolve the most appropriate active API key taking user custom keys into account
     */
    getActiveApiKey: function (userCustomKey = '') {
      if (userCustomKey && userCustomKey.trim().length > 10) {
        return userCustomKey.trim();
      }
      const primary = this.getPrimaryApiKey();
      if (primary) return primary;
      return this.getBackupApiKey();
    }
  };

  // Expose globally
  global.FayzarOcrConfig = FayzarOcrConfig;

})(typeof window !== 'undefined' ? window : this);
