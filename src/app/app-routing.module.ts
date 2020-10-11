import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoolComponent } from './pages/pool/pool.component';
import { SwapComponent } from './pages/swap/swap.component';

const routes: Routes = [
  { path: 'swap', component: SwapComponent },
  { path: 'pool', component: PoolComponent },

  { path: '', redirectTo: '/swap', pathMatch: 'full' },
  { path: '**', component: SwapComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
