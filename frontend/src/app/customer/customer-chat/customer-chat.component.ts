import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';


interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}


@Component({
  selector: 'app-customer-chat',
  standalone: false,
  templateUrl: './customer-chat.component.html',
  styleUrl: './customer-chat.component.css'
})
export class CustomerChatComponent implements OnInit{
  
  customerId: string = '';
  customerName: string = '';
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {

  }

  ngOnInit(): void {
    
    this.route.params.subscribe(params => {
      this.customerId = params['customerId'];
      this.loadCustomerInfo();
    });


    this.messages.push({
      text: 'Hoş geldiniz! Size nasıl yardımcı olabilirim?',
      isUser: false,
      timestamp: new Date()
    });

  }

  loadCustomerInfo(): void {
    this.apiService.getCustomerById(this.customerId).subscribe({
      next: (response) => {
        if(response && response.data){
          this.customerName = response.data.name;
        }
      },
      error: (error) => {
        console.error('Müşteri bilgilerini yüklerken hata oluştu', error);
      }
    });
  }


  sendMessage(): void {

    if(!this.newMessage.trim()) return;

    const userMessage: ChatMessage = {

      text: this.newMessage,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);


    const messageToSend = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    this.apiService.sendChatMessage(this.customerId, messageToSend).subscribe({
      next: (response) => {
        if(response && response.data){
          
          const botResponse: ChatMessage = {

            text: response.data.response,
            isUser: false,
            timestamp: new Date()

          };

          this.messages.push(botResponse);

        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Mesaj gönderilirken hata oluştu: ', error);

        const errorMessage: ChatMessage = {

          text: 'Üzgünüm, mesajınız iletilemedi. Lütfen daha sonra tekrar deneyin.',
          isUser: false,
          timestamp: new Date()
        };

        this.messages.push(errorMessage);
        this.isLoading = false;
      }
    });

  }


}
