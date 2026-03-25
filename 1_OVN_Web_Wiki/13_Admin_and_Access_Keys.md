# Admin & Access Keys

> Route: `/admin/keys`
> Tagline: "Research Access Keys"

---

## Overview

The Admin panel controls access to the OVN Nexus research portal. The entire Member Hub backend (dashboard, registries, biomarker engine, experiments, trials, ML lab) is gated behind an access key system. This page is the administrative interface for generating, distributing, and managing those keys.

---

## Generate Access Key

Administrators can generate new access keys in two formats:

| Format | Description | Example |
|--------|-------------|---------|
| **UUID** | Auto-generated universally unique identifier | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **Custom** | Human-readable custom string set by admin | `UCSF-RESEARCH-2024` |

Generated keys are immediately valid and can be shared with members to unlock the research portal via the input field on [[06_Member_Hub_Landing]].

---

## Grant Access by Email

An alternative to key distribution — administrators can grant research portal access directly by email address:

1. Enter the target user's email address
2. System sends an invitation with embedded access credentials
3. User clicks the link and gains immediate portal access
4. No manual key entry required on the user's side

This flow is designed for onboarding collaborating clinicians and researchers who may not be comfortable with manual key entry.

---

## All Access Keys Table

The admin panel displays a master table of all generated access keys:

| Column | Description |
|--------|-------------|
| **Key** | The access key string (UUID or custom) |
| **Type** | UUID or Custom |
| **Created** | Date the key was generated |
| **Created By** | Administrator who generated the key |
| **Status** | Active / Revoked / Expired |
| **Used By** | Email or user ID of the member who redeemed the key |
| **Used Date** | When the key was redeemed |

### Key Management Actions

- **Revoke** — immediately disable a key, blocking further access
- **Regenerate** — create a replacement key (useful for security rotation)
- **Export** — download key list for record-keeping

---

## Access Control Architecture

```
Admin generates key → Member enters key at /hub → Portal unlocks
                   → OR Admin grants by email → Portal unlocks via link

Portal access grants visibility to:
├── /dashboard    (Analytics)
├── /clinics      (Clinic Registry)
├── /patients     (Patient Registry)
├── /biomarkers   (Biomarker Engine)
├── /experiments  (Experiment Registry)
├── /datasets     (Data Lake)
├── /papers       (Publications)
├── /trials       (Clinical Trials)
├── /dashboard/ml (AI & ML Lab)
└── /dashboard/lab (Knowledge Graph Explorer)
```

---

## Cross-References

- Member hub where keys are entered: [[06_Member_Hub_Landing]]
- Research dashboard unlocked by keys: [[07_Dashboard_Analytics]]
- All backend tools requiring access: [[08_Clinics_Registry]], [[09_Patient_Registry]], [[10_Biomarker_Engine]], [[11_Experiments_Datasets_Papers]], [[12_Trials_and_ML_Lab]]

---

**Links**: [[00_Vault_Index]] | [[06_Member_Hub_Landing]] | [[07_Dashboard_Analytics]]
