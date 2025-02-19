import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements AfterViewInit {
  
  private dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>('dialog')
  
  
  ngAfterViewInit(): void {
    this.dialogElement().nativeElement.showModal();
  }
}
