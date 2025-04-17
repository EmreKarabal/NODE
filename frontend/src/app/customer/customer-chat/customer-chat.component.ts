// customer-chat.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-customer-chat',
  templateUrl: './customer-chat.component.html',
  styleUrls: ['./customer-chat.component.css'],
  standalone: false
})
export class CustomerChatComponent implements OnInit {
  
  customPrompt = '';
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isChatOpen: boolean = false;
  chatbotName: string = 'FLYBOT';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    // Sayfada ilk yüklendiğinde bot mesajı göstermiyoruz
    // Kullanıcı butona tıklayıp sohbeti açtığında welcome screen gösterilecek
    
    // Görüntü dosyalarının ön belleğe alınması için özel bir işleme gerek yok
    // Angular zaten görselleri kullanan componentleri yüklediğinde görselleri de yükler

    const fullUrl = this.router.url;
    const pageID = fullUrl.substring(fullUrl.lastIndexOf('/') + 1, fullUrl.length);
    
    this.apiService.getCustomerById(pageID).subscribe({
      next: (response) => {
        if (response.data){
          this.customPrompt = response.data.data[0].custom_prompt;
        }
        else {
          console.log('No customer data found');
        }
      }
    })
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    
    // Eğer chat penceresi ilk defa açılıyorsa ve mesaj yoksa, welcome screen gösterilecek
    // messages array'i boş olduğu için HTML'de welcome container görünecek
  }

  refreshChat(): void {
    this.messages = [];
    // Sohbeti yenilediğimizde tüm mesajları temizliyoruz, welcome screen tekrar görünecek
  }

  selectOption(option: string): void {
    // Kullanıcı hızlı seçenek butonlarına tıkladığında
    const userMessage: ChatMessage = {
      text: option,
      isUser: true,
      timestamp: new Date()
    };
    
    this.messages.push(userMessage);
    this.processOption(option);
  }

  processOption(option: string): void {
    this.isLoading = true;
    
    // Normalde burada API isteği yapılır, şimdilik simüle ediyoruz
    setTimeout(() => {
      let responseText = '';
      
      switch(option) {
        case 'Bagaj Hakkı Sorgulama':
          responseText = 'Bagaj hakkınızı sorgulamak için PNR kodunuzu veya bilet numaranızı paylaşabilir misiniz?';
          break;
        case 'Bilet Bilgileri Sorgulama':
          responseText = 'Bilet bilgilerinizi sorgulamak için PNR kodunuzu veya rezervasyon numaranızı yazabilirsiniz.';
          break;
        case 'Başvuru Sorgulama':
          responseText = 'Başvurunuzu sorgulamak için başvuru numaranızı paylaşır mısınız?';
          break;
        case 'Uçuş Durumu Sorgulama':
          responseText = 'Uçuş durumunu sorgulamak için uçuş numarasını ve tarihi paylaşabilir misiniz?';
          break;
        case 'ChatGPT ile Seyahatini Planla':
          responseText = 'Seyahatinizi planlamak için yardımcı olabilirim. Nereden nereye seyahat etmek istiyorsunuz?';
          break;
        case 'Diğer Konular':
          responseText = 'Size başka hangi konuda yardımcı olabilirim? Sorunuzu yazabilirsiniz.';
          break;
        default:
          responseText = 'Size nasıl yardımcı olabilirim?';
      }
      
      const botResponse: ChatMessage = {
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };
      
      this.messages.push(botResponse);
      this.isLoading = false;
      
      // Mesajlar güncellendiğinde scroll'u en alta alıyoruz
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }, 1000);
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const userMessage: ChatMessage = {
      text: this.newMessage,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);

    const customPromt = this.customPrompt;
    const messageToSend = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    // Scroll'u hemen güncelleyelim
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

  
    this.apiService.sendChatMessage(customPromt, messageToSend).subscribe({
      next: (response) => {
        if(response && response.data){
          const botResponse: ChatMessage = {
            text: response.data,
            isUser: false,
            timestamp: new Date()
          };
          this.messages.push(botResponse);
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
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
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      }
    });
    
  }
  
  scrollToBottom(): void {
    try {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }
}