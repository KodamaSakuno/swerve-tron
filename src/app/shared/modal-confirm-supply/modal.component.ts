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
  selector: 'modal-confirm-supply',
  templateUrl: 'dialog-overview-example.html',
  styleUrls: ['./modal-component.styl']
})
export class DialogOverviewConfirmSupply {

  animal: any;
  name: any;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewConfirmSupplyDialog, {
      width: '420px',
      panelClass: 'confirm-swap-modal',
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
export class DialogOverviewConfirmSupplyDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewConfirmSupplyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
