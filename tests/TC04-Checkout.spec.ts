import {test, expect} from '../fixtures/pages';
import {validCard,declineCard,expiredCard,validUser} from '../data/testData';



const validScenarios = [{cardNumber:validCard.cardNumber,cardDate:validCard.cardDate,cardCvc:validCard.cardCvc, expectedMessage:'¡Pago Aprobado!'}]
         

const invalidScenarios = [{cardNumber:declineCard.cardNumber,cardDate:declineCard.cardDate,cardCvc:declineCard.cardCvc, expectedError:'Pago Declinado'},
                          {cardNumber:expiredCard.cardNumber,cardDate:expiredCard.cardDate,cardCvc:expiredCard.cardCvc, expectedError:'Pago Declinado'}]

test.describe('TC04-Checkout', () => {
      
   for(const {cardNumber,cardDate,cardCvc,expectedMessage} of validScenarios){
       

    test(`Checkout with valid card - ${cardNumber || cardDate || cardCvc}`, async({catalogoPag,creditCardPage,loginPage})=>{
                 
        await loginPage.login(validUser.email,validUser.password);
        await catalogoPag.addItemTocart(); 
        await expect(catalogoPag.itemCard).not.toHaveCount(0);
        await creditCardPage.btnPayNow.click(); 
        await creditCardPage.fillCardDetails(cardNumber,cardDate,cardCvc);
        await expect(creditCardPage.modalAlert).toBeVisible();
        await expect(creditCardPage.expectedMessage).toContainText(validScenarios[0].expectedMessage);
        
   });
 }


  for(const {cardNumber,cardDate,cardCvc,expectedError} of invalidScenarios){
       

    test(`Checkout with invalid card - ${cardNumber || cardDate || cardCvc}`, async({catalogoPag,creditCardPage,loginPage})=>{
                 
        await loginPage.login(validUser.email,validUser.password);
        await catalogoPag.addItemTocart(); 
        await expect(catalogoPag.itemCard).not.toHaveCount(0);
        await creditCardPage.btnPayNow.click(); 
        await creditCardPage.fillCardDetails(cardNumber,cardDate,cardCvc);
        await expect(creditCardPage.modalAlert).toBeVisible();
        await expect(creditCardPage.expectedMessage).toContainText(expectedError);

        
   });
 
 }
    
});



