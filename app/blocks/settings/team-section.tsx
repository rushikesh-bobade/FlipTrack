import { Link, Form, useActionData, useNavigation } from "react-router";
import { useState, useEffect } from "react";
import styles from "./team-section.module.css";

interface Props { className?: string; user?: any; }

export function TeamSection({ className, user }: Props) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "invite-member";
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (actionData?.intent === "invite-member" && actionData?.ok) {
      setShowSuccess(true);
    }
  }, [actionData]);

  if (!user) return null;

  if (user.plan !== "BUSINESS") {
    return (
      <div className={[styles.section, className].filter(Boolean).join(" ")}>
        <h2 className={styles.title}>Team</h2>
        <div className={styles.gate}>
          Team collaboration is a Business plan feature. Upgrade to invite up to 5 team members and share your inventory.
          <br />
          <Link to="/app/settings/billing" className={styles.gateBtn}>Upgrade to Business</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <h2 className={styles.title}>Team</h2>
      {user.team ? (
        <div className={styles.teamList}>
          <p style={{marginBottom: "var(--space-3)", color: "var(--color-text-secondary)"}}>Your team: <strong>{user.team.name}</strong></p>
          {user.team.members.map((m: any) => (
            <div key={m.id} className={styles.memberCard}>
              <div className={styles.avatar}>{m.name ? m.name.substring(0, 2).toUpperCase() : 'U'}</div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{m.name || "Unknown"}</div>
                <div className={styles.memberRole}>{m.role}</div>
              </div>
            </div>
          ))}
          <button type="button" className={styles.gateBtn} style={{marginTop: "var(--space-4)", alignSelf: "flex-start"}} onClick={() => setIsInviteOpen(true)}>Invite Member</button>
          
          {isInviteOpen && (
            <div className={styles.modalOverlay} role="presentation">
              <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className={styles.modalHeader}>
                  <h3 id="modal-title" className={styles.modalTitle}>Invite Team Member</h3>
                  <button className={styles.closeBtn} aria-label="Close" onClick={() => { setIsInviteOpen(false); setShowSuccess(false); }}>&times;</button>
                </div>
                
                {showSuccess ? (
                  <div className={styles.successMessage}>
                    <p style={{marginBottom: "var(--space-2)"}}>{actionData.message}</p>
                    <p style={{fontSize: "0.85rem", color: "var(--color-text-muted)", wordBreak: "break-all", background: "var(--color-bg)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)"}}>
                      {actionData.inviteLink}
                    </p>
                    <div className={styles.modalActions}>
                      <button className={styles.gateBtn} onClick={() => { setIsInviteOpen(false); setShowSuccess(false); }}>Close</button>
                    </div>
                  </div>
                ) : (
                  <Form method="post">
                    <input type="hidden" name="intent" value="invite-member" />
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email Address</label>
                      <input name="email" type="email" className={styles.input} required placeholder="member@example.com" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Role</label>
                      <select name="role" className={styles.input}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    {actionData?.intent === "invite-member" && !actionData?.ok && (
                      <p style={{color: "var(--color-danger)", fontSize: "0.85rem", marginTop: "var(--space-2)"}}>{actionData.error}</p>
                    )}
                    
                    <div className={styles.modalActions}>
                      <button type="button" className={styles.cancelBtn} onClick={() => { setIsInviteOpen(false); setShowSuccess(false); }} disabled={isSubmitting}>Cancel</button>
                      <button type="submit" className={styles.gateBtn} disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send Invite"}</button>
                    </div>
                  </Form>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Form method="post" className={styles.createTeamForm}>
          <input type="hidden" name="intent" value="create-team" />
          <div className={styles.field}>
            <label className={styles.label}>Team Name</label>
            <input name="teamName" className={styles.input} required placeholder="e.g. Acme Resell" />
          </div>
          <button type="submit" className={styles.gateBtn}>Create Team</button>
        </Form>
      )}
    </div>
  );
}
