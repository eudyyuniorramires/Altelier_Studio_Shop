import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';


export class CreditCardPage extends BasePage{


    readonly inputCardNumber: Locator;

    readonly inputCardDate: Locator;

    readonly inputCardCvc: Locator;

    readonly btnPay:Locator;

    readonly btnPayNow:Locator;

    readonly errorMessage:Locator;

    readonly modalAlert:Locator;

    readonly expectedMessage:Locator;


    constructor(page:Page){

          super (page);

        this.inputCardNumber = page.getByTestId('card-number');

        this.inputCardDate = page.getByTestId('card-expiry');

        this.inputCardCvc = page.getByTestId('card-cvc');

        this.btnPay = page.getByTestId('btn-pay-now');

        this.errorMessage = page.getByTestId('card-error');

        this.errorMessage = page.locator('.toast-container');

        this.btnPayNow = page.locator('[data-testid="cart-checkout-btn"]');

        this.modalAlert = page.locator('.toast-container');

        this.expectedMessage = page.locator('.toast__title');

    }


    async fillCardDetails(cardNumber:string,cardDate:string,cardCvc:string):Promise<void>{


        await this.inputCardNumber.fill(cardNumber);

        await this.inputCardDate.fill(cardDate);

        await this.inputCardCvc.fill(cardCvc);

        await this.btnPay.click();

    }



}