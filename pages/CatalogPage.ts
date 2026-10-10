import {Page,Locator} from '@playwright/test';

import {BasePage} from './BasePage';

export class CatalogoPage extends BasePage{
  
    readonly item: Locator;

    readonly btnAddTocart: Locator;

    readonly btnCloseCard: Locator;

    readonly btnSize: Locator;
  
    readonly btnColor:Locator;

    readonly itemCard: Locator;

    readonly modalAlert: Locator;


    constructor(page:Page){

        super(page);

        this.item = page.getByTestId('product-card');

        this.btnAddTocart = page.getByTestId('add-to-cart-btn');

        this.btnCloseCard = page.getByTestId('close-cart-btn');

        this.btnSize = page.locator('.product-card__size-btn ');
         
        this.btnColor = page.locator('.product-card__color-btn');

        this.itemCard = page.locator('.cart-item')

        this.modalAlert = page.locator('.toast-container');
    }


    async addItemTocart():Promise<void>{
       
        await this.goto('http://localhost:5000/')
             
            await this.btnSize.nth(2).click();
            await this.btnColor.first().click();
            await this.btnAddTocart.nth(2).click();

        }
}