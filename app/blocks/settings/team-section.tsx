import { Link, Form } from "react-router";
import styles from "./team-section.module.css";

interface Props { className?: string; user?: any; }

export function TeamSection({ className, user }: Props) {
  if (!user) return null;

  if (user.plan !== "BUSINESS") {
    return (
      <div className={[styles.section, className].filter(Boolean).join(" ")}>
        <h2 className={styles.title}>Team</h2>
        <div className={styles.gate}>
          Team collaboration is a Business plan feature. Upgrade to invite up to 5 team members and share your inventory.
          <br />
          <Link to="/settings/billing" className={styles.gateBtn}>Upgrade to Business</Link>
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
          <button className={styles.gateBtn} style={{marginTop: "var(--space-4)"}}>Invite Member</button>
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
