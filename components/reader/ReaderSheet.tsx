"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactElement, ReactNode } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage } from "@/lib/languages";
import styles from "./reader.module.css";

export function ReaderSheet({ open, onOpenChange, title, trigger, children }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string;
  trigger: ReactElement; children: ReactNode;
}) {
  const { preferences, t } = usePreferences();
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.sheetOverlay} />
      <Dialog.Content className={styles.sheet} dir={getLanguage(preferences.interfaceLanguage).dir} aria-describedby={undefined}>
        <header className={styles.sheetHeader}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close className={styles.iconButton} aria-label={t("close")}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.5" /></svg>
          </Dialog.Close>
        </header>
        <div className={styles.sheetBody}>{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
