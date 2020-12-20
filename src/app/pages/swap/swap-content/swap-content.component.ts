import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { StateService } from '../../../services/state.service';
import { TokenInfo } from '../../../types/TokenInfo';

@Component({
  selector: 'app-swap-content',
  templateUrl: './swap-content.component.html',
  styleUrls: ['./swap-content.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwapContentComponent implements OnInit {

  @Input()
  from: TokenInfo | null = null;

  @Input()
  to: TokenInfo | null = null;

  input = '';

  @Input()
  amount: BigNumber | null = null;
  @Input()
  targetAmount: BigNumber | null = null;

  @Output()
  inputChange = new EventEmitter<BigNumber>();
  @Output()
  pairSwitchClicked = new EventEmitter();
  @Output()
  priceSwitchClicked = new EventEmitter();

  @Input()
  price: string | null = null;

  @Input()
  shouldApprove = false;
  @Input()
  isApproving = false;
  @Input()
  isSwapping = false;

  constructor(private stateService: StateService) { }

  ngOnInit(): void {
  }

  pairSwitch() {
    if (this.targetAmount && this.to) {
      this.input = this.targetAmount.div(new BigNumber(10).pow(this.to.decimals)).toString();
    }
    else {
      this.input = ''
    }
    this.pairSwitchClicked.emit();
  }

  async approve() {
    this.isApproving = true;
    try {
      await this.stateService.approve(this.from!.address, this.amount!);
    } finally {
      this.isApproving = false;
    }
  }
  async swap() {
    this.isSwapping = true;
    try {
      await this.stateService.swap(this.from!.address, this.amount!);

      this.input = '';
    } finally {
      this.isSwapping = false;
    }
  }

}
