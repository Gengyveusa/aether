---
status: "Active"
category: "candidates"
type: "metabolite-candidate"
due:
priority: "P0-Critical"
cancer-signature: "altered FAD/FADH2 in tumors, extended CRY radical pair"
aging-signature: "FAD cofactor damage, Trp oxidation"
proteins: [CRY1, CRY2, SDH, MTHFR, MAO]
swarm-artifact-id: "SC-003"
tags: [candidate, FAD, flavoprotein, cryptochrome, probius-target]
created: "2026-03-22"
updated: "2026-03-22"
---

# FAD Flavoprotein State — Quantum Metabolite Candidate

> **Dual role: ETC electron carrier AND cryptochrome radical pair precursor**

---

## Cancer Amplification

FAD serves as the essential cofactor for both mitochondrial electron transfer and cryptochrome spin dynamics. In cancer:

- **CRY1/CRY2 overexpression**: Cryptochrome proteins are overexpressed in breast, colorectal, and ovarian cancers. Higher CRY levels mean more FAD-Trp radical pair generation, extending coherent spin dynamics that drive circadian disruption and proliferative gene programs.
- **Extended radical pair lifetime**: Tumor microenvironments with elevated antioxidant capacity (GSH) protect the FAD semiquinone radical from premature quenching, extending the singlet-triplet interconversion window.
- **SDH mutations**: Succinate dehydrogenase (Complex II) mutations in paraganglioma and renal cell carcinoma alter FAD/FADH2 cycling, creating a constitutively reduced FAD pool that feeds both ETC and spin dynamics.
- **Altered MTHFR**: Methylenetetrahydrofolate reductase (FAD-dependent) polymorphisms in cancer alter one-carbon metabolism, coupling FAD redox state to nucleotide synthesis and epigenetic regulation.

### Key Evidence
| Finding | Reference |
|---|---|
| CRY1 overexpression in breast cancer | Cadenas et al., *BMC Cancer* 2014 |
| SDH mutations and FAD pool alterations | Bardella et al., *Hum Mol Genet* 2011 |
| Extended radical pair in CRY | Maeda et al., *Nature* 2012 |
| MTHFR-FAD linkage in cancer risk | Ericson et al., *Clin Cancer Res* 2009 |

---

## Aging Decoherence

In aging, FAD cofactor integrity declines through oxidative and structural mechanisms:

- **Tryptophan oxidation**: The Trp residues forming the radical pair electron transfer chain in CRY (W400→W377→W324) are oxidized via the kynurenine pathway, which is upregulated with age. Kynurenine/tryptophan ratio increases 2-3x between ages 30 and 80.
- **FAD cofactor damage**: Cumulative oxidative damage to the isoalloxazine ring of FAD reduces its quantum yield for radical pair formation. Aged tissues show decreased FAD fluorescence lifetime.
- **MAO upregulation**: Monoamine oxidase (FAD-dependent) activity increases with age, consuming FAD in neurotransmitter degradation and generating H₂O₂ — a classical oxidative pathway that depletes the quantum-competent FAD pool.
- **SDH decline**: Complex II activity decreases with age, reducing FAD cycling efficiency and increasing electron leak at the flavin site.

### Key Evidence
| Finding | Reference |
|---|---|
| Kynurenine pathway activation with age | Sorgdrager et al., *Cell Rep* 2019 |
| FAD fluorescence decline in aged tissue | Skala et al., *PNAS* 2007 |
| MAO-B increase with aging | Fowler et al., *J Neural Transm* 2003 |
| Complex II decline with age | Lenaz et al., *Biochim Biophys Acta* 2006 |

---

## Match Score

**3 out of 4 architectures** — Strong involvement

| Architecture | Involvement | Mechanism |
|---|---|---|
| FMO Coherence | ⬜ Indirect | FAD not primary coherence carrier, but Complex II coupling |
| Enzyme Tunneling | ✅ Direct | FAD-dependent enzymes (MAO, MTHFR) use tunneling |
| Mito ETC Transfer | ✅ Direct | Complex II (SDH) FAD → ubiquinone electron transfer |
| Cryptochrome Spin | ✅ Direct | FAD is THE radical pair precursor in CRY1/CRY2 |

### Probius QES Readout
- **Electrochemical detection**: FAD reduction at -0.2V to -0.6V (square-wave voltammetry)
- **LOD**: 0.2 μM in whole blood
- **Clinical range**: 1-100 μM
- **Paired ratio**: FAD/FADH2 (reduction peak height ratio)

---

## Key References

1. Hore, P.J. & Mouritsen, H. (2016). The radical-pair mechanism of magnetoreception. *Annu Rev Biophys* 45:299
2. Chaves, I. et al. (2011). The cryptochromes. *Annu Rev Plant Biol* 62:335
3. Rivlin, R.S. (2007). Riboflavin (vitamin B2) and health. *Am J Clin Nutr* 85:S131
4. Xu, P. et al. (2021). The role of cryptochrome 1 in cancer. *Cell Death Dis* 12:1035

---

## Links

- [[Core-Thesis]]
- [[NADH-Redox-State]]
- [[ATP-Energy-Charge]]
- [[GSH-Redox-Defense]]
- [[CYP450-Tunneling-Network]]
- [[Probius-QES-Protocol]]
- [[ScienceClaw-Agent-Profile]]
