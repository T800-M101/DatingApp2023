import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit{
  member: Member | undefined;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  // First the instance of the Class is constructed (javascript level) and injected with dependencies
  constructor(private memberService: MembersService, private router: ActivatedRoute){}
  
  // Second the view is also constructed. By the time this happens the component (Angular level) has not been initialized completely
  // so we need to use optinal chaining parameter in the properties in HTML or *ngIf conditional in the tags.

  // NgOnInit is executed after the checks of the input-output bounds (@Inpyt/@Output - @ngOnChanges)
  ngOnInit(): void {
    this.loadMember();
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]

  }

  getImages() {
    if (!this.member) return [];

    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url
      })
    }

    return imageUrls;
  }

  loadMember(): void {
    const username = this.router.snapshot.paramMap.get('username');

    if (!username) return;

    this.memberService.getMember(username).subscribe({
      next: member => {
        this.member = member,
        this.galleryImages = this.getImages(); 
      }
    })
  }





}
