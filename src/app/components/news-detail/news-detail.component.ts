import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit {
  article: any;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id = params.get('id');
        if (id) {
          return this.newsService.getArticle(id);
        } else {
          throw new Error('Article ID not provided or invalid');
        }
      })
    ).subscribe(
      (article: any) => {
        this.article = article;
        console.log('Article:', this.article);
      },
      error => {
        console.error('Error fetching article:', error);
      }
    );
  }
}
