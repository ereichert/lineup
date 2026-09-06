export default class PositionAssignmentPrintView {
  constructor(
    // Identifies the row and keeps bench spots distinct from one another.
    public position: string,
    public player: string,
    // What the printed sheet actually shows, which drops the bench numbering.
    public label: string = position
  ) {}
}
