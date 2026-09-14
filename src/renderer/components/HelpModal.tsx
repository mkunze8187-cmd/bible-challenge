import { useState } from "react";
import type { HelpTab } from "../helpContent";

interface HelpModalProps {
  titleId: string;
  title: string;
  eyebrow: string;
  tabs: HelpTab[];
  onClose: () => void;
}

export function HelpModal({ titleId, title, eyebrow, tabs, onClose }: HelpModalProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="section-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="help-modal-tabs" role="tablist" aria-label={`${title} help topics`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab?.id === tab.id}
              className={`help-modal-tab ${activeTab?.id === tab.id ? "help-modal-tab-active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="help-modal-body">
          {activeTab?.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </section>
    </div>
  );
}
