import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'https://api.spaceflightnewsapi.net/v4/articles';
  private filterKeywordsSubject = new BehaviorSubject<string>('');
  filterKeywords$ = this.filterKeywordsSubject.asObservable();

  constructor(private http: HttpClient) { }
  getArticles(limit: number = 100): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?limit=${limit}`).pipe(
      map(response => response.results.map((article: any) => ({
        id: article.id,
        title: article.title,
        date: article.published_date,
        summary: article.summary.length > 100 ? article.summary.substring(0, 97) + '...' : article.summary,
        imageUrl: article.image_url
      })))
    );
  }

  setFilterKeywords(keywords: string): void {
    this.filterKeywordsSubject.next(keywords);
  }

  getFilteredArticles(): Observable<any[]> {
    return combineLatest([this.getArticles(), this.filterKeywords$]).pipe(
      map(([articles, keywords]) => {
        if (!keywords) {
          return articles;
        }
        keywords = keywords.toLowerCase();
        return articles.filter(article =>
          article.title.toLowerCase().includes(keywords) ||
          article.summary.toLowerCase().includes(keywords)
        ).sort((a, b) => {
          const aTitleMatch = a.title.toLowerCase().includes(keywords);
          const bTitleMatch = b.title.toLowerCase().includes(keywords);
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          return 0;
        });
      })
    );
  }
  getArticle(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(article => ({
        id: article.id,
        title: article.title,
        date: article.published_date,
        summary: article.summary,
        imageUrl: article.image_url,
        news_site: article.news_site,
        content: article.content // Adjust based on API response structure
      }))
    );
  }
}
