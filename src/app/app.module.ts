import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {A11yModule} from '@angular/cdk/a11y';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {OverlayModule} from '@angular/cdk/overlay';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SwapComponent } from './pages/swap/swap.component';
import { PoolComponent } from './pages/pool/pool.component';
import { NavTabsComponent } from './shared/nav-tabs/nav-tabs.component';
import { SwapOrPoolNavComponent } from './shared/swap-or-pool-nav/swap-or-pool-nav.component';
import { BoxHeaderComponent } from './shared/box-header/box-header.component';
import { YourPositionComponent } from './shared/your-position/your-position.component';
import { HeaderComponent } from './shared/header/header.component';
import { SetingComponent } from './shared/seting/seting.component';
import { StateService } from './services/state.service';
import { AddLiquidityComponent } from './pages/add-liquidity/add-liquidity.component';
import { RemoveLiquidityComponent } from './pages/remove-liquidity/remove-liquidity.component';
import { BigNumberPipe } from './bignumber.pipe';
import { TokenAmountInputComponent } from './shared/token-amount-input/token-amount-input.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DialogOverviewConnectWallet } from './shared/modal-connect-wallet/modal.component';
import { DialogOverviewAccount } from './shared/modal-account/modal.component';
import { DialogOverviewTranscation } from './shared/modal-transcation/modal.component';
import { DialogOverviewConfirmSwap } from './shared/modal-confirm-swap/modal.component';
import { DialogOverviewConfirmSupply } from './shared/modal-confirm-supply/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    SwapComponent,
    PoolComponent,
    NavTabsComponent,
    SwapOrPoolNavComponent,
    BoxHeaderComponent,
    YourPositionComponent,
    HeaderComponent,
    SetingComponent,
    AddLiquidityComponent,
    RemoveLiquidityComponent,
    BigNumberPipe,
    TokenAmountInputComponent,
    DialogOverviewConnectWallet,
    DialogOverviewAccount,
    DialogOverviewTranscation,
    DialogOverviewConfirmSwap,
    DialogOverviewConfirmSupply
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (service: StateService) => () => service.initialize(),
      deps: [StateService],
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
