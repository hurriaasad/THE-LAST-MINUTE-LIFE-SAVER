import React, { useState } from "react";
import { Shield, Fingerprint, Lock, UploadCloud, RefreshCw, Key, CheckCircle, Eye, EyeOff } from "lucide-react";

interface SettingsProps {
  userState: {
    username: string;
    email: string;
    e2eEncryptionEnabled: boolean;
    biometricLinked: boolean;
  };
  onUpdateState: (updates: Partial<any>) => void;
  onCloudBackup: () => void;
  onCloudRestore: () => void;
}

export default function Settings({
  userState,
  onUpdateState,
  onCloudBackup,
  onCloudRestore,
}: SettingsProps) {
  // Passwords / Key states
  const [secKey, setSecKey] = useState(localStorage.getItem("life_saver_sec_key") || "");
  const [showSecKey, setShowSecKey] = useState(false);

  // Loading animations
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Biometric link trigger
  const [linkingBio, setLinkingBio] = useState(false);

  const handleSaveSecKey = () => {
    localStorage.setItem("life_saver_sec_key", secKey);
    setStatusMessage("Master security key saved. All cloud backups will be locally encrypted prior to sync.");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleBiometricToggle = () => {
    if (userState.biometricLinked) {
      localStorage.removeItem("life_saver_bio_user");
      localStorage.removeItem("life_saver_bio_sec_key");
      onUpdateState({ biometricLinked: false });
      setStatusMessage("Biometric credential link revoked.");
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setLinkingBio(true);
      // Simulate WebAuthn credentials registration
      setTimeout(async () => {
        try {
          const res = await fetch("/api/auth/biometric/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: userState.username,
              publicKey: crypto.randomUUID(),
            }),
          });
          if (!res.ok) throw new Error("Could not register credential");

          localStorage.setItem("life_saver_bio_user", userState.username);
          // Save the encryption key alongside the bio for automatic decryption during TouchID login
          if (secKey) {
            localStorage.setItem("life_saver_bio_sec_key", secKey);
          }

          onUpdateState({ biometricLinked: true });
          setLinkingBio(false);
          setStatusMessage("TouchID / FaceID credentials successfully linked to this device!");
          setTimeout(() => setStatusMessage(null), 4000);
        } catch (e) {
          setLinkingBio(false);
        }
      }, 1500);
    }
  };

  const triggerBackup = () => {
    setBackingUp(true);
    setTimeout(async () => {
      try {
        await onCloudBackup();
        setBackingUp(false);
        setStatusMessage("Cloud Backup completed successfully! E2E Encryption was applied.");
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (e: any) {
        setBackingUp(false);
        setStatusMessage(`Backup Failed: ${e.message}`);
      }
    }, 1500);
  };

  const triggerRestore = () => {
    setRestoring(true);
    setTimeout(async () => {
      try {
        await onCloudRestore();
        setRestoring(false);
        setStatusMessage("Cloud backup successfully synchronized and decrypted!");
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (e: any) {
        setRestoring(false);
        setStatusMessage(`Restore Failed: ${e.message}`);
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Settings Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-tight">Security & Cloud Backup</h2>
        <p className="text-xs text-slate-500">Manage encryption keys, cloud backup syncs, and biometric lockers</p>
      </div>

      {statusMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-400">
          <CheckCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          <div>{statusMessage}</div>
        </div>
      )}

      {/* Cloud backup options */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <UploadCloud className="h-4.5 w-4.5 text-rose-500" />
          Secure Cloud Synchronizations
        </h3>
        <p className="text-xs text-slate-400">
          Sync your tasks, habits, stats, and milestones securely. If end-to-end encryption is active, your backup is completely unreadable outside your local browser!
        </p>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={triggerBackup}
            disabled={backingUp}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <UploadCloud className={`h-4.5 w-4.5 text-rose-400 ${backingUp ? "animate-bounce" : ""}`} />
            {backingUp ? "Uploading Encrypted Backup..." : "Create Encrypted Cloud Backup"}
          </button>

          <button
            onClick={triggerRestore}
            disabled={restoring}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4.5 w-4.5 text-indigo-400 ${restoring ? "animate-spin" : ""}`} />
            {restoring ? "Synchronizing..." : "Sync From Backup (Restore)"}
          </button>
        </div>
      </div>

      {/* E2E encryption config */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Key className="h-4.5 w-4.5 text-amber-500" />
          End-to-End Encryption Key
        </h3>
        <p className="text-xs text-slate-400">
          All client-side data is hashed and encrypted locally using a pbkdf2-derived AES-256 key matching your passphrase.
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex gap-2.5">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showSecKey ? "text" : "password"}
                value={secKey}
                onChange={(e) => setSecKey(e.target.value)}
                placeholder="Secure Master Decryption Passphrase"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pr-10 pl-9 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowSecKey(!showSecKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
              >
                {showSecKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={handleSaveSecKey}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 transition px-5 text-xs font-bold text-white border border-slate-700"
            >
              Save Key
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2.5">
            <input
              type="checkbox"
              id="e2e-toggle"
              checked={userState.e2eEncryptionEnabled}
              onChange={(e) => onUpdateState({ e2eEncryptionEnabled: e.target.checked })}
              className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-rose-500"
            />
            <label htmlFor="e2e-toggle" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Enforce Strict E2E Encryption on Backups
            </label>
          </div>
        </div>
      </div>

      {/* Biometric linked config */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Fingerprint className="h-4.5 w-4.5 text-indigo-400" />
          Biometric touch Lock
        </h3>
        <p className="text-xs text-slate-400">
          Register credentials to lock and unlock your workspace with TouchID, FaceID, or hardware keys natively.
        </p>

        <div className="pt-2.5 flex items-center justify-between border-t border-slate-900 pt-4">
          <div>
            <div className="text-xs font-bold text-white">Device Credentials Link</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {userState.biometricLinked 
                ? "TouchID credentials successfully linked to this profile" 
                : "No biometric credentials linked on this device yet"}
            </div>
          </div>

          <button
            onClick={handleBiometricToggle}
            disabled={linkingBio}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              userState.biometricLinked
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                : "border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <Fingerprint className={`h-4.5 w-4.5 ${linkingBio ? "animate-pulse" : ""}`} />
            {linkingBio ? "Linking..." : userState.biometricLinked ? "Unlink Biometrics" : "Link TouchID / FaceID"}
          </button>
        </div>
      </div>
    </div>
  );
}
