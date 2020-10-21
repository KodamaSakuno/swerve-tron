import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  animal: any;
  name: any;
}

/**
 * @title Dialog Overview
 */
@Component({
  selector: 'dialog-overview-transcation',
  templateUrl: 'dialog-overview-example.html',
  styleUrls: ['./modal-component.styl']
})
export class DialogOverviewTranscation {

  animal: any;
  name: any;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewTranscationDialog, {
      width: '420px',
      panelClass: 'transcation-modal',
      data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
  styleUrls: ['./modal-component.styl']
})
export class DialogOverviewTranscationDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewTranscationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
