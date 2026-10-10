import {BasePage} from "./BasePage";
import{Page,Locator} from "@playwright/test";


export class RegisterPage extends BasePage{

readonly nameInput:Locator;

readonly emailInput:Locator;

readonly passwordInput:Locator;

readonly addressInput:Locator;

readonly cityInput:Locator;

readonly postalInput:Locator;

readonly btnRegister:Locator;

readonly errorMessage:Locator;

readonly authUser:Locator;

readonly errorInputPassword:Locator;


constructor(page:Page){

    super(page);

    this.nameInput = page.getByTestId('register-name');
    
    this.emailInput = page.getByTestId('register-email');

    this.passwordInput = page.getByTestId('register-password');

    this.addressInput = page.getByTestId('register-street');

    this.cityInput = page.getByTestId('register-city');

    this.postalInput = page.getByTestId('register-zip');

    this.btnRegister = page.getByTestId('register-submit-btn');

    this.authUser = page.getByTestId('nav-user-name');

    this.errorMessage = page.getByTestId('register-error-alert');

    this.errorInputPassword = page.getByTestId('error-password');

}


async register(name:string,email:string,password:string,address:string,city:string,postal:string):Promise<void>{

  
    await this.goto('/register.html')

    await this.nameInput.fill(name);

    await this.emailInput.fill(email);

    await this.passwordInput.fill(password);

    await this.addressInput.fill(address);

    await this.cityInput.fill(city);

    await this.postalInput.fill(postal);

    await this.btnRegister.click();

}
 


}