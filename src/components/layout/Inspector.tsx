import React from 'react';
import { useStore } from '../../store/simulationStore';
import EventLoopInspector from '../../modules/eventLoop/EventLoopInspector';
import ExpressInspector from '../../modules/express/ExpressInspector';
import MongoInspector from '../../modules/mongodb/MongoInspector';
import ReactInspector from '../../modules/react/ReactInspector';
import AuthInspector from '../../modules/auth/AuthInspector';
import WebSocketInspector from '../../modules/websocket/WebSocketInspector';
import CachingInspector from '../../modules/caching/CachingInspector';
import MicroservicesInspector from '../../modules/microservices/MicroservicesInspector';
import GraphQLInspector from '../../modules/graphql/GraphQLInspector';
import IntroInspector from '../../modules/intro/IntroInspector';
import StrugglesInspector from '../../modules/struggles/StrugglesInspector';
import FullJourneyInspector from '../../modules/fullJourney/FullJourneyInspector';
import WipInspector from '../../modules/wip/WipInspector';
import './Inspector.css';

const INSPECTORS: Record<string, React.ComponentType> = {
    'intro': IntroInspector,
    'struggles': StrugglesInspector,
    'event-loop': EventLoopInspector,
    'express': ExpressInspector,
    'middleware': ExpressInspector,
    'mongodb': MongoInspector,
    'aggregation': MongoInspector,
    'indexing': MongoInspector,
    'react': ReactInspector,
    'auth': AuthInspector,
    'websockets': WebSocketInspector,
    'caching': CachingInspector,
    'microservices': MicroservicesInspector,
    'graphql': GraphQLInspector,
    'full-journey': FullJourneyInspector,
};


export default function Inspector() {
    const { snapshot } = useStore();
    const [activeTab, setActiveTab] = React.useState<'specs' | 'story'>('specs');

    const ModuleInspector = snapshot.activeModule ? (INSPECTORS[snapshot.activeModule] || WipInspector) : undefined;
    const story = snapshot.learningStory;

    return (
        <aside className="inspector">
            <div className="inspector__header">
                <span className="inspector__title">Inspector</span>
                <div className="inspector__tabs">
                    <button
                        className={`inspector__tab ${activeTab === 'specs' ? 'inspector__tab--active' : ''}`}
                        onClick={() => setActiveTab('specs')}
                    >
                        Specs
                    </button>
                    <button
                        className={`inspector__tab ${activeTab === 'story' ? 'inspector__tab--active' : ''}`}
                        onClick={() => setActiveTab('story')}
                    >
                        Story
                    </button>
                </div>
            </div>
            <div className="inspector__content">
                {activeTab === 'specs' ? (
                    ModuleInspector ? <ModuleInspector /> : (
                        <div className="inspector__empty">
                            <span style={{ fontSize: '24px', opacity: 0.3 }}>🔍</span>
                            <span>Select a module to inspect its runtime state.</span>
                        </div>
                    )
                ) : (
                    <div className="learning-story">
                        {story ? (
                            <>
                                <div className="learning-story__header">
                                    <span className="learning-story__icon">💡</span>
                                    <h4 className="learning-story__title">{story.title}</h4>
                                </div>
                                <div className="learning-story__section">
                                    <span className="learning-story__section-title">The Big Idea</span>
                                    <p className="learning-story__content">{story.content}</p>
                                </div>
                                <div className="learning-story__analogy">
                                    <span className="learning-story__section-title">Simple Analogy</span>
                                    <p className="learning-story__analogy-text">"{story.analogy}"</p>
                                </div>
                                <div className="learning-story__simulator">
                                    <span className="learning-story__section-title">Simulator Secret</span>
                                    <p className="learning-story__look-for">
                                        <span className="learning-story__look-icon">👀</span>
                                        {story.lookFor}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="inspector__empty">
                                <span style={{ fontSize: '24px', opacity: 0.3 }}>📖</span>
                                <span>No story available for this module yet.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
