/**
 * Created by manasb on 25-12-2016.
 */
import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {ChatMessage} from "../../domain/chat-message";
import {User} from "../../domain/user";
import {SocketMessageService} from "../../services/socket-message-service";
import {MessageFactory} from "../../domain/message-factory";
import {MessageSource} from "../../domain/message-source";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  public chatMessages: ChatMessage[] = [];
  public chatInputText: string = "";

  public constructor(
    private socketMessageService: SocketMessageService,
    private dataService: DataService
  ) {}

  public ngOnInit(): void {
    this.socketMessageService.chatMessages$.subscribe((chatMessage: ChatMessage) => {
      this.chatMessages.push(chatMessage);
    });
  }

  public ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const mainContainer = document.getElementById("main");
    mainContainer.scrollTop = mainContainer.scrollHeight;
  }

  public isCurrentUser(user: User) {
    const currentUser = this.dataService.currentUser;
    return currentUser && currentUser.username === user.username;
  }

  public isSystemMessage(chatMessage: ChatMessage) {
    return chatMessage.source === MessageSource[MessageSource.SYSTEM];
  }

  public onSendButtonClick(event: Event): void {
    event.preventDefault();
    this.sendChatMessage();
  }

  public onInputKeyPress(event: KeyboardEvent): void {
    if (event.charCode == 13 /* ENTER */) {
      this.sendChatMessage();
    }
  }

  private sendChatMessage(): void {
    const messageText = this.chatInputText;

    if (!this.dataService.currentUser) {
      console.error("No current user found so cannot send message");
      return;
    }

    if (messageText.length == 0) {
      alert("Message should be more than 0 characters long");
      return;
    }

    const chatMessage = MessageFactory.createChatMessage(this.dataService.currentUser, messageText);
    this.socketMessageService.sendSocketMessage(chatMessage);

    this.chatInputText = "";
  }

  public convertTimeStampToDate(timestamp: number): Date {
    return new Date(timestamp);
  }
}
