import PositionAssignmentPrintView from './PositionAssignmentPrintView'

export default class InningFieldingLineupPrintView {
  constructor(
    public inning: string,
    public positionAssignments: PositionAssignmentPrintView[]
  ) {}
}
