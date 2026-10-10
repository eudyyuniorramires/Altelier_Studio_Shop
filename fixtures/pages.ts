import {test as base, expect} from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';
import {RegisterPage} from '../pages/RegisterPage';
import {CatalogoPage} from '../pages/CatalogPage';
import {CreditCardPage} from '../pages/CreditCardPage';

type PageObject = {
 
    loginPage:LoginPage;

    registerPage:RegisterPage;

    catalogoPag:CatalogoPage;

    creditCardPage:CreditCardPage;

};


export const test = base.extend<PageObject>({
 
    loginPage: async({page}, use) => {
        await use(new LoginPage(page));
    },

    registerPage: async({page}, use) =>{

        await use (new RegisterPage(page));
    },
    catalogoPag: async({page}, use)=>{
         
        await use(new CatalogoPage(page));
    },
    creditCardPage: async({page}, use) =>{

        await use(new CreditCardPage(page));
    }



});


export {expect};

