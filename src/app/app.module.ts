import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
import { TronStatusComponent } from './shared/tron-status/tron-status.component';
import { AmountInputComponent } from './shared/amount-input/amount-input.component';
import { TokenInputComponent } from './shared/token-input/token-input.component';
import { AddLiquidityContentComponent } from './pages/add-liquidity/add-liquidity-content/add-liquidity-content.component';

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
    TronStatusComponent,
    AmountInputComponent,
    TokenInputComponent,
    AddLiquidityContentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (service: StateService) => () => service.initialize(),
      deps: [StateService],
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
