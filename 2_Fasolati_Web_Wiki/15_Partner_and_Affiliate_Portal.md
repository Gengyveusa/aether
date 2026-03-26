# Partner & Affiliate Portal

> **Source:** fasolati.life -- Affiliate section, About/Contact section, partner form
> **Integration:** HubSpot Forms API (portalId: 243149587)
> **Position:** Multi-role partnership intake and affiliate program

---

## Overview

Fasolati.life includes a **partner/contact portal** accessible from the About section and Affiliate nav item. It uses role-based intake to route inquiries from clinicians, investors, DSO partners, researchers, and general interest contacts.

---

## Partner Roles

| Role | Icon | Description |
|------|------|-------------|
| **Clinician** | Medical cross | "Pilot the platform in your practice" |
| **Investor** | Diamond | "Fund the node network" |
| **DSO Partner** | Hexagon | "Integrate the therapeutic cascade" |
| **Researcher** | Star | "Collaborate on clinical studies" |
| **General Interest** | Arrow | "Stay in the loop on Fasolati developments" |

---

## Contact Form

### Form Fields

| Field | Type | Required |
|-------|------|----------|
| **First Name** | Text input | Yes |
| **Last Name** | Text input | Yes |
| **Email** | Email input | Yes |
| **Phone** | Phone input | No |
| **Company / Practice** | Text input | No |
| **Message** | Textarea | No |

### Form Behavior

| State | Display |
|-------|---------|
| **No role selected** | "Select a role above to continue" (submit disabled) |
| **Role selected** | "Submit -- Let's Connect" (submit enabled) |
| **Success** | "We've Got It -- Thanks for reaching out. Your information has been received and someone from the Fasolati team will be in touch within 48 hours." |

### Success State CTAs

After successful submission, two follow-up links are presented:
- **Launch Engine UI** -- interactive health dashboard prototype
- **View Deep Dive** -- full technical and business overview document

---

## Technical Integration

| Component | Detail |
|-----------|--------|
| **Form provider** | HubSpot Forms API |
| **Portal ID** | 243149587 |
| **Tracking** | Cookie-based (hubspotutk) |
| **Fallback** | localStorage backup for form submissions |
| **Validation** | Client-side required field validation + role selection highlighting |

---

## Affiliate Program

> "Earn commissions on Fasolati ecosystem referrals"

The Affiliate section (accessible via the top nav "Affiliate" dropdown) describes a partner program for earning commissions on referrals. Specific commission rates and terms are not detailed on the public page -- interested parties are directed to the contact form.

---

## Role-Specific Value Propositions

### For Clinicians

| Value | Detail |
|-------|--------|
| **Early access** | Pilot program for Fasolati Engine and Maxoral products |
| **New revenue** | Lytica as billable in-office procedure; Loria subscription referrals |
| **Differentiation** | Oral-systemic integrated care as competitive advantage |
| **Data** | Engine provides outcome tracking across patient portfolio |

See [[10_For_Clinicians]] for full clinician details.

### For Investors

| Value | Detail |
|-------|--------|
| **Market** | $50B oral + $71B gut + AI precision medicine intersection |
| **Model** | Four revenue streams (intervention, subscription, gut, SaaS) |
| **Scale** | Node network thesis -- value compounds with adoption |
| **Resources** | Deep Dive Document, Node Network Map, Framework Explorer |

See [[12_Investor_Deep_Dive]] for full investor details.

### For DSO Partners

| Value | Detail |
|-------|--------|
| **System of care** | Complete therapeutic cascade (Lytica + Loria) deployed across network |
| **Economics** | High-margin intervention + recurring subscription per patient |
| **Data** | Network-wide outcome data via Fasolati Engine |
| **Distribution** | Henry Schein, Patterson, Benco fulfillment |

See [[08_Therapeutic_Cascade_and_Distribution]] for distribution architecture.

### For Researchers

| Value | Detail |
|-------|--------|
| **Collaboration** | Clinical study partnerships on oral-systemic connections |
| **Data access** | De-identified aggregated data from the Fasolati Engine network |
| **Platform** | Biomarker tracking and outcome measurement infrastructure |

---

## Related Files

- [[10_For_Clinicians]] -- Full clinician program details
- [[12_Investor_Deep_Dive]] -- Full investor information
- [[08_Therapeutic_Cascade_and_Distribution]] -- DSO integration and distribution
- [[00_Index_and_Navigation]] -- Site map showing partner form location
- [[14_Legal_Disclaimers_Attribution]] -- Data handling for submitted information

---

#partner #affiliate #contact #HubSpot #clinician #investor #DSO #researcher #form #intake
