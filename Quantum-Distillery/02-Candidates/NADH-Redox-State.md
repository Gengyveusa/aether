---
status: "Active"
category: "candidates"
type: "metabolite-candidate"
due:
priority: "P0-Critical"
cancer-signature: "elevated NADH/NAD+ ratio"
aging-signature: "depleted NAD+ pool"
proteins: [Complex-I, NAMPT, SIRT1, PARP1]
swarm-artifact-id: "SC-002"
tags: [candidate, NADH, redox, probius-target]
created: "2026-03-22"
updated: "2026-03-22"
---

# NADH Redox State — Quantum Metabolite Candidate

> **Primary Probius QES target — direct electrochemical detection**

---

## Cancer Amplification

NADH is the primary electron donor to Complex I, the entry point for mitochondrial electron tunneling. In cancer:

- **Elevated NADH/NAD+ ratio**: Tumor cells maintain a high NADH/NAD+ ratio through upregulated glycolysis (Warburg effect) AND enhanced OXPHOS in aggressive tumors. This ensures saturated electron input to Complex I, maximizing coherent electron transfer efficiency.
- **NAMPT overexpression**: Nicotinamide phosphoribosyltransferase (NAMPT) is overexpressed in multiple cancers (breast, colorectal, ovarian, glioblastoma), maintaining elevated NAD+ biosynthesis to fuel SIRT-mediated chromatin remodeling while keeping NADH pools full for ETC.
- **Complex I amplification**: Cancer cells upregulate Complex I subunits (NDUFV1, NDUFS1) and stabilize supercomplex assembly, enhancing the quantum tunneling chain that NADH feeds.
- **Reverse electron transfer (RET)**: Tumor mitochondria use NADH-driven RET at Complex I to generate controlled superoxide for HIF-1α stabilization and metastatic signaling — a quantum tunneling-dependent process.

### Key Evidence
| Finding | Reference |
|---|---|
| NAMPT overexpression in breast cancer | Garten et al., *Cancer Res* 2010 |
| NADH/NAD+ ratio elevated in tumor lysates | Santidrian et al., *J Clin Invest* 2013 |
| Complex I supercomplex stabilization in tumors | Acín-Pérez et al., *Mol Cell* 2008 |
| RET-driven ROS in cancer signaling | Robb et al., *Free Radic Biol Med* 2018 |

---

## Aging Decoherence

In aging, the NAD+ pool declines through multiple mechanisms that collectively decohere the quantum architectures NADH sustains:

- **NAD+ depletion**: Systemic NAD+ levels decline 30-50% between ages 30 and 70. This reduces NADH availability for Complex I electron input, decreasing coherent transfer efficiency.
- **PARP1 overconsumption**: Accumulated DNA damage activates PARP1, which consumes NAD+ for poly(ADP-ribose) synthesis. PARP1 activity increases 2-5x with age, creating an NAD+ sink.
- **SIRT1 dysfunction**: Declining NAD+ reduces sirtuin deacetylase activity, disrupting mitochondrial biogenesis (PGC-1α pathway) and further degrading ETC supercomplex assembly.
- **CD38 upregulation**: The NADase CD38 increases with age-associated inflammation (inflammaging), accelerating NAD+ degradation through a non-quantum classical hydrolysis pathway.

### Key Evidence
| Finding | Reference |
|---|---|
| Age-dependent NAD+ decline | Massudi et al., *PLoS ONE* 2012 |
| PARP1 hyperactivation with age | Braidy et al., *PLoS ONE* 2011 |
| CD38 drives age-related NAD+ decline | Camacho-Pereira et al., *Cell Metab* 2016 |
| SIRT1 decline and mitochondrial dysfunction | Gomes et al., *Cell* 2013 |

---

## Match Score

**3 out of 4 architectures** — Direct involvement

| Architecture | Involvement | Mechanism |
|---|---|---|
| FMO Coherence | ✅ Direct | NADH → Complex I electron input for coherent transfer |
| Enzyme Tunneling | ✅ Indirect | NAD+/NADH ratio modulates ADH/ALDH tunneling activity |
| Mito ETC Transfer | ✅ Direct | NADH is THE primary electron donor to the tunneling chain |
| Cryptochrome Spin | ⬜ Indirect | NADH links to circadian NAD+ oscillations but not direct spin |

### Probius QES Readout
- **Direct electrochemical detection**: NADH oxidation at +0.3V vs Ag/AgCl
- **LOD**: 0.5 μM in whole blood
- **Clinical range**: 10-500 μM
- **Paired ratio**: NADH/NAD+ (requires NAD+ measurement at separate potential)

---

## Key References

1. Ying, W. (2008). NAD+/NADH and NADP+/NADPH in cellular functions and cell death. *Antioxid Redox Signal* 10:179
2. Verdin, E. (2015). NAD+ in aging, metabolism, and neurodegeneration. *Science* 350:1208
3. Cantó, C. et al. (2015). NAD+ metabolism and the control of energy homeostasis. *Cell Metab* 22:31
4. Chini, C.C.S. et al. (2017). NAD and the aging process. *Curr Opin Clin Nutr Metab Care* 20:366

---

## Links

- [[Core-Thesis]]
- [[FAD-Flavoprotein-State]]
- [[ATP-Energy-Charge]]
- [[GSH-Redox-Defense]]
- [[Probius-QES-Protocol]]
- [[ScienceClaw-Agent-Profile]]
