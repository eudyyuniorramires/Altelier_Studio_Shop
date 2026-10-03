import {test as base, expect} from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';
import {RegisterPage} from '../pages/Register';

type PageObject = {
 
    loginPage:LoginPage;

    registerPage:RegisterPage;

};


export const test = base.extend<PageObject>({
 
    loginPage: async({page}, use) => {
        await use(new LoginPage(page));
    },

    registerPage: async({page}, use) =>{

        await use (new RegisterPage(page));
    }

});


export {expect};

