export default class FieldingRowPrintView {
  constructor(
    // Identifies the row and keeps bench spots distinct from one another.
    public position: string,
    // What the printed sheet actually shows, which drops the bench numbering.
    public label: string,
    // One player name per inning, in inning order. Empty where nobody is assigned.
    public playersByInning: string[]
  ) {}
}
